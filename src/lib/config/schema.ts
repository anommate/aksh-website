import { z } from "zod";

/*
 * Server configuration rules (TRD §13). Pure functions so tests can run them
 * directly; application code reads configuration through ./server.
 *
 * Error messages name the variable and the fix. They may echo a non-secret
 * value; never echo a secret value.
 */

export const APP_MODES = ["development", "preview", "production"] as const;
export type AppMode = (typeof APP_MODES)[number];

export const CONTENT_SOURCES = ["repository"] as const;
export type ContentSource = (typeof CONTENT_SOURCES)[number];

// Only the demo adapter exists. Production adapters are added once the
// consultation destination is decided (docs/audit/DECISIONS.md O-05).
export const CONSULTATION_ADAPTERS = ["demo"] as const;
export type ConsultationAdapter = (typeof CONSULTATION_ADAPTERS)[number];

export const DEFAULT_DESTINATION_TIMEOUT_MS = 8000;
export const DEFAULT_LOOKUP_TIMEOUT_MS = 3000;
// TRD §9 bounds the whole enquiry handler to 15 seconds.
export const HANDLER_DEADLINE_MS = 15_000;

export type ServerConfig = {
  appMode: AppMode;
  /** Canonical public origin, e.g. "https://www.example.com". Required in production. */
  siteUrl: string | undefined;
  contentSource: ContentSource;
  /** IANA time zone; required once date preferences are enabled (Milestone 4). */
  clinicTimezone: string | undefined;
  consultation: {
    /** Undefined means enquiries are not configured. */
    adapter: ConsultationAdapter | undefined;
    destinationTimeoutMs: number;
    lookupTimeoutMs: number;
  };
};

export type EnvSource = Readonly<Record<string, string | undefined>>;

export class ConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(
      [
        "Invalid server configuration:",
        ...issues.map((issue) => `  - ${issue}`),
        "Every variable is described in .env.example.",
      ].join("\n"),
    );
    this.name = "ConfigError";
    this.issues = issues;
  }
}

// An empty value in a .env file means "not set".
const unset = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = z.preprocess(unset, z.string().optional());

const appModeSchema = z.preprocess(
  unset,
  z.enum(APP_MODES, {
    error: (issue) =>
      issue.input === undefined
        ? "APP_MODE is not set. Set it to development, preview, or production (for local work, put APP_MODE=development in .env.local)."
        : `APP_MODE "${String(issue.input)}" is not valid. Use development, preview, or production.`,
  }),
);

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]);

function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

const isBareOrigin = (url: URL) =>
  (url.protocol === "https:" || url.protocol === "http:") &&
  !url.username &&
  !url.password &&
  url.pathname === "/" &&
  !url.search &&
  !url.hash;

function siteUrlSchema(mode: AppMode) {
  return optionalText.transform((value, ctx) => {
    if (value === undefined) {
      if (mode === "production") {
        ctx.addIssue({
          code: "custom",
          message:
            "SITE_URL is required when APP_MODE=production. Set it to the verified public origin, such as https://www.example.com (the production domain is pending, DECISIONS O-06).",
        });
        return z.NEVER;
      }
      return undefined;
    }

    const url = parseUrl(value);
    if (!url || !isBareOrigin(url)) {
      ctx.addIssue({
        code: "custom",
        message: `SITE_URL "${value}" must be an origin only, such as https://www.example.com, with no path, query, fragment, or credentials.`,
      });
      return z.NEVER;
    }

    if (mode === "production") {
      if (url.protocol !== "https:") {
        ctx.addIssue({
          code: "custom",
          message: `SITE_URL must use https when APP_MODE=production (got ${url.origin}).`,
        });
        return z.NEVER;
      }
      if (LOCAL_HOSTNAMES.has(url.hostname)) {
        ctx.addIssue({
          code: "custom",
          message: `SITE_URL must be the public production origin when APP_MODE=production, not ${url.origin}.`,
        });
        return z.NEVER;
      }
    }
    return url.origin;
  });
}

function consultationAdapterSchema(mode: AppMode) {
  return optionalText.transform((value, ctx): ConsultationAdapter | undefined => {
    if (value === undefined) return undefined;
    if (value !== "demo") {
      ctx.addIssue({
        code: "custom",
        message: `CONSULTATION_ADAPTER "${value}" is not available. The only adapter is "demo" (development and preview); production adapters arrive once DECISIONS O-05 names a destination.`,
      });
      return z.NEVER;
    }
    if (mode === "production") {
      ctx.addIssue({
        code: "custom",
        message:
          "CONSULTATION_ADAPTER=demo is refused when APP_MODE=production: it would acknowledge requests that were never sent. Leave CONSULTATION_ADAPTER unset (enquiries then show as unavailable) until an approved adapter exists.",
      });
      return z.NEVER;
    }
    return value;
  });
}

const contentSourceSchema = z.preprocess(
  unset,
  z
    .enum(CONTENT_SOURCES, {
      error: (issue) =>
        `CONTENT_SOURCE "${String(issue.input)}" is not supported. Use "repository" (or leave it unset); a CMS needs an owner decision first.`,
    })
    .default("repository"),
);

function isIanaTimeZone(value: string) {
  // Intl also accepts UTC offsets such as "+05:30"; TRD §13 asks for an IANA name.
  if (!/^[A-Za-z]/.test(value)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const clinicTimezoneSchema = optionalText.transform((value, ctx) => {
  if (value === undefined || isIanaTimeZone(value)) return value;
  ctx.addIssue({
    code: "custom",
    message: `CLINIC_TIMEZONE "${value}" is not an IANA time zone name (Area/Location form from the tz database).`,
  });
  return z.NEVER;
});

function millisecondsSchema(name: string, fallback: number) {
  return optionalText.transform((value, ctx) => {
    if (value === undefined) return fallback;
    const ms = /^\d+$/.test(value) ? Number(value) : Number.NaN;
    if (!Number.isSafeInteger(ms) || ms < 1 || ms > HANDLER_DEADLINE_MS) {
      ctx.addIssue({
        code: "custom",
        message: `${name} must be a whole number of milliseconds from 1 to ${HANDLER_DEADLINE_MS} (got "${value}").`,
      });
      return z.NEVER;
    }
    return ms;
  });
}

function settingsSchema(mode: AppMode) {
  return z
    .object({
      SITE_URL: siteUrlSchema(mode),
      CONTENT_SOURCE: contentSourceSchema,
      CLINIC_TIMEZONE: clinicTimezoneSchema,
      CONSULTATION_ADAPTER: consultationAdapterSchema(mode),
      DESTINATION_TIMEOUT_MS: millisecondsSchema(
        "DESTINATION_TIMEOUT_MS",
        DEFAULT_DESTINATION_TIMEOUT_MS,
      ),
      LOOKUP_TIMEOUT_MS: millisecondsSchema(
        "LOOKUP_TIMEOUT_MS",
        DEFAULT_LOOKUP_TIMEOUT_MS,
      ),
    })
    .superRefine((settings, ctx) => {
      // One destination write plus one reconciliation lookup must fit the handler deadline.
      const total = settings.DESTINATION_TIMEOUT_MS + settings.LOOKUP_TIMEOUT_MS;
      if (total > HANDLER_DEADLINE_MS) {
        ctx.addIssue({
          code: "custom",
          message: `DESTINATION_TIMEOUT_MS + LOOKUP_TIMEOUT_MS is ${total} ms; together they must fit the ${HANDLER_DEADLINE_MS} ms enquiry handler deadline.`,
        });
      }
    });
}

const messages = (error: z.ZodError) => error.issues.map((issue) => issue.message);

/**
 * Validates environment settings. Throws ConfigError listing every problem.
 * APP_MODE is checked first because the other rules depend on it.
 */
export function parseServerConfig(env: EnvSource): ServerConfig {
  const mode = appModeSchema.safeParse(env.APP_MODE);
  if (!mode.success) throw new ConfigError(messages(mode.error));

  const settings = settingsSchema(mode.data).safeParse(env);
  if (!settings.success) throw new ConfigError(messages(settings.error));

  const s = settings.data;
  return {
    appMode: mode.data,
    siteUrl: s.SITE_URL,
    contentSource: s.CONTENT_SOURCE,
    clinicTimezone: s.CLINIC_TIMEZONE,
    consultation: {
      adapter: s.CONSULTATION_ADAPTER,
      destinationTimeoutMs: s.DESTINATION_TIMEOUT_MS,
      lookupTimeoutMs: s.LOOKUP_TIMEOUT_MS,
    },
  };
}
