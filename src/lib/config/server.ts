import "server-only";
import { toPublicConfig, type PublicConfig } from "./public";
import { parseServerConfig, type ServerConfig } from "./schema";

let cached: ServerConfig | undefined;

/**
 * Validated server configuration. Never pass the result to a Client
 * Component; use getPublicConfig() for that.
 *
 * Values read while a page is prerendered are fixed at build time. Where a
 * runtime value matters, call `await connection()` from next/server first.
 */
export function getServerConfig(): ServerConfig {
  cached ??= parseServerConfig(process.env);
  return cached;
}

/** The browser-safe subset of the configuration. */
export function getPublicConfig(): PublicConfig {
  return toPublicConfig(getServerConfig());
}
