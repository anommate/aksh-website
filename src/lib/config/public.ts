import type { AppMode, ServerConfig } from "./schema";

/**
 * Settings that may reach the browser, passed to Client Components as props.
 * Add a field only when its value is intentionally public; secrets, provider
 * settings, and timeouts stay in ServerConfig.
 */
export type PublicConfig = {
  appMode: AppMode;
  siteUrl: string | null;
};

export function toPublicConfig(config: ServerConfig): PublicConfig {
  return {
    appMode: config.appMode,
    siteUrl: config.siteUrl ?? null,
  };
}
