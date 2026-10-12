import { writeFileSync } from "node:fs";
import type { Browser, Page } from "@playwright/test";

type Clip = { x: number; y: number; width: number; height: number };
type Frame = { at: number; jpeg: Buffer };

/**
 * Short screen recordings without Playwright's ffmpeg (a separate download
 * outside the project): timed JPEG frames of one page area, encoded to WebM
 * by the browser's own MediaRecorder, played back at their real timing.
 */
export async function recordArea(
  page: Page,
  clip: Clip,
  path: string,
  { frameInterval = 125, script }: { frameInterval?: number; script: (elapsed: () => number) => Promise<void> }
) {
  const frames: Frame[] = [];
  const start = Date.now();
  const elapsed = () => Date.now() - start;
  let recording = true;

  const sampler = (async () => {
    while (recording) {
      const at = elapsed();
      frames.push({ at, jpeg: await page.screenshot({ clip, type: "jpeg", quality: 80 }) });
      const wait = frameInterval - (elapsed() - at);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    }
  })();
  await script(elapsed);
  recording = false;
  await sampler;

  await encodeWebm(page.context().browser()!, frames, clip, path);
  return frames.length;
}

async function encodeWebm(browser: Browser, frames: Frame[], clip: Clip, path: string) {
  const context = await browser.newContext();
  const encoder = await context.newPage();
  await encoder.setContent("<canvas></canvas>");
  const width = Math.round(clip.width);
  const height = Math.round(clip.height);
  const base64 = await encoder.evaluate(
    async ({ frames, width, height }) => {
      const canvas = document.querySelector("canvas")!;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d")!;
      const images = await Promise.all(
        frames.map(async (frame) => createImageBitmap(await (await fetch(`data:image/jpeg;base64,${frame.data}`)).blob()))
      );
      context.drawImage(images[0], 0, 0, width, height);

      const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t))!;
      const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: type, videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      const stopped = new Promise((resolve) => (recorder.onstop = resolve));
      recorder.start();
      const t0 = performance.now();
      for (let i = 0; i < images.length; i++) {
        const wait = frames[i].at - (performance.now() - t0);
        if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
        context.drawImage(images[i], 0, 0, width, height);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
      recorder.stop();
      await stopped;

      const bytes = new Uint8Array(await new Blob(chunks, { type: "video/webm" }).arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(binary);
    },
    { frames: frames.map((frame) => ({ at: frame.at, data: frame.jpeg.toString("base64") })), width, height }
  );
  await context.close();
  writeFileSync(path, Buffer.from(base64, "base64"));
}
