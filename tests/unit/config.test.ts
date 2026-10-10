import { describe, expect, it } from "vitest";
import { toPublicConfig } from "@/lib/config/public";
import {
  ConfigError,
  parseServerConfig,
  type EnvSource,
} from "@/lib/config/schema";

// Returns the ConfigError issues for an invalid environment.
function issuesFor(env: EnvSource): readonly string[] {
  try {
    parseServerConfig(env);
  } catch (error) {
    if (error instanceof ConfigError) return error.issues;
    throw error;
  }
  throw new Error("Expected parseServerConfig to reject this environment");
}

const PRODUCTION = {
  APP_MODE: "production",
  SITE_URL: "https://www.example.com",
} as const;

describe("APP_MODE", () => {
  it("is required, and the error explains how to set it", () => {
    for (const env of [{}, { APP_MODE: "" }, { APP_MODE: "   " }]) {
      const [issue] = issuesFor(env);
      expect(issue).toMatch(/APP_MODE is not set/);
      expect(issue).toMatch(/APP_MODE=development/);
    }
  });

  it("rejects values outside development, preview, and production", () => {
    for (const value of ["staging", "Production", "prod", "test"]) {
      expect(issuesFor({ APP_MODE: value })).toEqual([
        `APP_MODE "${value}" is not valid. Use development, preview, or production.`,
      ]);
    }
  });

  it("gives a ConfigError whose message lists the problem and points to .env.example", () => {
    expect(() => parseServerConfig({ APP_MODE: "staging" })).toThrow(
      /Invalid server configuration:[\s\S]*APP_MODE "staging"[\s\S]*\.env\.example/,
    );
  });
});

describe("local development", () => {
  it("works with APP_MODE alone: no site URL, credentials, or integrations", () => {
    expect(parseServerConfig({ APP_MODE: "development" })).toEqual({
      appMode: "development",
      siteUrl: undefined,
      contentSource: "repository",
      clinicTimezone: undefined,
      consultation: {
        adapter: undefined,
        destinationTimeoutMs: 8000,
        lookupTimeoutMs: 3000,
      },
    });
  });

  it("treats empty values copied from .env.example as unset", () => {
    const config = parseServerConfig({
      APP_MODE: "development",
      SITE_URL: "",
      CONTENT_SOURCE: "",
      CLINIC_TIMEZONE: "",
      CONSULTATION_ADAPTER: "",
      DESTINATION_TIMEOUT_MS: "",
      LOOKUP_TIMEOUT_MS: "",
    });
    expect(config.siteUrl).toBeUndefined();
    expect(config.consultation.destinationTimeoutMs).toBe(8000);
  });

  it("allows the demo consultation adapter in development and preview", () => {
    for (const mode of ["development", "preview"]) {
      const config = parseServerConfig({
        APP_MODE: mode,
        CONSULTATION_ADAPTER: "demo",
      });
      expect(config.consultation.adapter).toBe("demo");
    }
  });
});

describe("production", () => {
  it("accepts a public https origin and normalises it", () => {
    const config = parseServerConfig({
      ...PRODUCTION,
      SITE_URL: "https://www.example.com/",
    });
    expect(config.appMode).toBe("production");
    expect(config.siteUrl).toBe("https://www.example.com");
  });

  it("requires SITE_URL", () => {
    const [issue] = issuesFor({ APP_MODE: "production" });
    expect(issue).toMatch(/SITE_URL is required when APP_MODE=production/);
  });

  it("requires https and a public host", () => {
    expect(
      issuesFor({ ...PRODUCTION, SITE_URL: "http://www.example.com" })[0],
    ).toMatch(/must use https/);
    expect(
      issuesFor({ ...PRODUCTION, SITE_URL: "https://localhost:3000" })[0],
    ).toMatch(/must be the public production origin/);
  });

  it("refuses the demo adapter", () => {
    const [issue] = issuesFor({ ...PRODUCTION, CONSULTATION_ADAPTER: "demo" });
    expect(issue).toMatch(/CONSULTATION_ADAPTER=demo is refused/);
  });

  it("does not require enquiry settings while enquiries are not configured", () => {
    expect(parseServerConfig(PRODUCTION).consultation.adapter).toBeUndefined();
  });

  it("reports every problem at once", () => {
    const issues = issuesFor({
      APP_MODE: "production",
      CONSULTATION_ADAPTER: "demo",
      CLINIC_TIMEZONE: "Nowhere/Invalid",
    });
    expect(issues).toHaveLength(3);
    expect(issues.join("\n")).toMatch(/SITE_URL[\s\S]*CLINIC_TIMEZONE[\s\S]*CONSULTATION_ADAPTER/);
  });
});

describe("settings", () => {
  it("rejects a SITE_URL that is not a bare origin", () => {
    for (const value of [
      "www.example.com",
      "https://www.example.com/clinic",
      "https://www.example.com/?q=1",
      "https://user:pass@www.example.com",
      "ftp://www.example.com",
    ]) {
      expect(issuesFor({ APP_MODE: "development", SITE_URL: value })[0]).toMatch(
        /must be an origin only/,
      );
    }
  });

  it("rejects adapters and content sources that do not exist", () => {
    expect(
      issuesFor({ APP_MODE: "development", CONSULTATION_ADAPTER: "email" })[0],
    ).toMatch(/CONSULTATION_ADAPTER "email" is not available/);
    expect(
      issuesFor({ APP_MODE: "development", CONTENT_SOURCE: "cms" })[0],
    ).toMatch(/CONTENT_SOURCE "cms" is not supported/);
  });

  it("accepts IANA time zones and rejects offsets and unknown names", () => {
    expect(
      parseServerConfig({ APP_MODE: "development", CLINIC_TIMEZONE: "Etc/UTC" })
        .clinicTimezone,
    ).toBe("Etc/UTC");
    for (const value of ["+05:30", "GMT+5", "Mars/Olympus"]) {
      expect(
        issuesFor({ APP_MODE: "development", CLINIC_TIMEZONE: value })[0],
      ).toMatch(/is not an IANA time zone name/);
    }
  });

  it("validates timeouts as whole milliseconds within the handler deadline", () => {
    const config = parseServerConfig({
      APP_MODE: "development",
      DESTINATION_TIMEOUT_MS: "5000",
      LOOKUP_TIMEOUT_MS: "2000",
    });
    expect(config.consultation).toMatchObject({
      destinationTimeoutMs: 5000,
      lookupTimeoutMs: 2000,
    });

    for (const value of ["8s", "0", "1.5", "-1", "15001"]) {
      expect(
        issuesFor({ APP_MODE: "development", DESTINATION_TIMEOUT_MS: value })[0],
      ).toMatch(/DESTINATION_TIMEOUT_MS must be a whole number of milliseconds/);
    }
  });

  it("rejects timeouts that together exceed the 15 s handler deadline", () => {
    const [issue] = issuesFor({
      APP_MODE: "development",
      DESTINATION_TIMEOUT_MS: "12000",
      LOOKUP_TIMEOUT_MS: "4000",
    });
    expect(issue).toMatch(/16000 ms; together they must fit the 15000 ms/);
  });
});

describe("browser-safe configuration", () => {
  it("exposes only the allowlisted public fields", () => {
    const server = parseServerConfig({
      ...PRODUCTION,
      CLINIC_TIMEZONE: "Etc/UTC",
      LOOKUP_TIMEOUT_MS: "2500",
      // Reserved secret: not parsed yet, and must never reach the browser.
      RECEIPT_SIGNING_SECRET: "synthetic-test-secret-not-a-real-value",
    });
    const browser = toPublicConfig(server);

    expect(browser).toEqual({
      appMode: "production",
      siteUrl: "https://www.example.com",
    });
    expect(JSON.stringify(browser)).not.toMatch(/synthetic-test-secret|2500|Etc\/UTC/);
  });
});
