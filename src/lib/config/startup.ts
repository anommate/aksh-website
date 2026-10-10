import { ConfigError, parseServerConfig } from "./schema";

/**
 * Validates configuration when the server starts. On invalid settings it
 * prints the actionable messages and exits: without this, Next.js logs the
 * error but keeps the process alive, answering every request with a 500.
 */
export function assertConfigAtStartup(): void {
  try {
    parseServerConfig(process.env);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    console.error(`\n${error.message}\n`);
    process.exit(1);
  }
}
