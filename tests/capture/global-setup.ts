import { existsSync, mkdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

/**
 * Chooses and creates the output folder for one `pnpm test:capture` run:
 * - CAPTURE_DIR: a folder inside the repository, for captures meant to be
 *   kept (for example docs/audit/screenshots/<new-name>);
 * - otherwise captures/<CAPTURE_NAME>, or captures/<UTC timestamp> when no
 *   name is given (git-ignored).
 * The folder must not exist yet, so a run never overwrites earlier captures.
 * Workers read the result from AKSH_CAPTURE_DIR (see output.ts).
 */
export default function globalSetup() {
  const root = process.cwd();
  const stamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
  const dir = resolve(root, process.env.CAPTURE_DIR ?? join("captures", process.env.CAPTURE_NAME ?? stamp));
  const inside = relative(root, dir);
  if (!inside || inside.startsWith("..") || isAbsolute(inside)) {
    throw new Error(`Capture folder must be inside the repository: ${dir}`);
  }
  if (existsSync(dir)) {
    throw new Error(`Capture folder already exists; choose a new name so earlier captures are kept: ${inside}`);
  }
  mkdirSync(dir, { recursive: true });
  process.env.AKSH_CAPTURE_DIR = dir;
  console.log(`Captures: ${inside}`);
}
