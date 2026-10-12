import { join } from "node:path";

/** Path for one capture inside this run's folder (chosen by global-setup.ts). */
export function captureFile(name: string) {
  const dir = process.env.AKSH_CAPTURE_DIR;
  if (!dir) throw new Error("Run captures with `pnpm test:capture`, which chooses their folder.");
  return join(dir, name);
}
