import { GovernancePhase } from "@brand-governance/shared";

export interface AppConfig {
  port: number;
  phase: GovernancePhase;
  brandMiddlewareUrl: string;
  policiesDir: string;

  airtable: {
    apiKey: string;
    baseId: string;
  };

  slack: {
    botToken: string;
    signingSecret: string;
    channels: {
      critical: string;
      warnings: string;
      info: string;
    };
  };

  jwt: {
    secret: string;
  };
}

export function loadConfig(): AppConfig {
  const phase = (process.env.GOVERNANCE_PHASE as GovernancePhase) ?? GovernancePhase.Observe;

  return {
    port: parseInt(process.env.PORT ?? "3100", 10),
    phase,
    brandMiddlewareUrl: process.env.BRAND_MIDDLEWARE_URL ?? "http://localhost:3000",
    policiesDir: process.env.POLICIES_DIR ?? "../../policies",

    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY ?? "",
      baseId: process.env.AIRTABLE_BASE_ID ?? "",
    },

    slack: {
      botToken: process.env.SLACK_BOT_TOKEN ?? "",
      signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
      channels: {
        critical: process.env.SLACK_CHANNEL_CRITICAL ?? "#brand-governance-critical",
        warnings: process.env.SLACK_CHANNEL_WARNINGS ?? "#brand-governance-alerts",
        info: process.env.SLACK_CHANNEL_INFO ?? "#brand-governance-log",
      },
    },

    jwt: {
      secret: process.env.JWT_SECRET ?? "",
    },
  };
}
