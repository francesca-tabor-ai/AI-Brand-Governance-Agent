import express from "express";
import cors from "cors";
import type { PipelineConfig } from "@brand-governance/engine";
import { PolicyRegistry } from "@brand-governance/engine";
import { AirtableClient, SlackClient } from "@brand-governance/integrations";
import type { AppConfig } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createAuthGuard } from "./middleware/auth-guard.js";
import { createHealthRouter } from "./routes/health.js";
import { createGovernanceRouter } from "./routes/governance.js";
import { createWebhookRouter } from "./routes/webhooks.js";
import { runAllChecks } from "@brand-governance/qa-rules";
import { applyFixes } from "@brand-governance/auto-fix";

export function createApp(config: AppConfig) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Load policies
  const policyRegistry = new PolicyRegistry(config.policiesDir);
  policyRegistry.load();
  console.log(
    `[Governance] Loaded ${policyRegistry.getAll().length} policy set(s), ${policyRegistry.ruleCount} rule(s)`,
  );

  // Initialize integrations (optional — degrade gracefully if not configured)
  const airtableClient =
    config.airtable.apiKey && config.airtable.baseId
      ? new AirtableClient(config.airtable)
      : null;

  const slackClient = config.slack.botToken
    ? new SlackClient({
        botToken: config.slack.botToken,
        channels: config.slack.channels,
      })
    : null;

  // Pipeline config
  const pipelineConfig: PipelineConfig = {
    phase: config.phase,
    policyRegistry,
    checkRunner: {
      runChecks: async (event, rules, brandPayload) =>
        runAllChecks(event, rules, brandPayload),
    },
    fixService: {
      applyFixes: async (event, results, brandPayload) =>
        applyFixes(event, results, brandPayload),
    },
  };

  // Brand payload fetcher (calls project 3 middleware)
  const fetchBrandPayload = async (brandId: string): Promise<unknown> => {
    const url = `${config.brandMiddlewareUrl}/api/brand/${brandId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[BrandPayload] Failed to fetch from ${url}: ${response.status}`);
        return { swatches: [], typography: [], logos: [], disclaimers: [], claims: [], markets: [] };
      }
      return response.json();
    } catch (err) {
      console.warn(`[BrandPayload] Error fetching from ${url}:`, err);
      return { swatches: [], typography: [], logos: [], disclaimers: [], claims: [], markets: [] };
    }
  };

  // Airtable base URL for deep links
  const airtableBaseUrl = config.airtable.baseId
    ? `https://airtable.com/${config.airtable.baseId}`
    : "https://airtable.com";

  // Routes
  const authGuard = createAuthGuard(config.jwt.secret);

  app.use(createHealthRouter(config, policyRegistry));
  app.use(authGuard, createGovernanceRouter(pipelineConfig, fetchBrandPayload));
  app.use(
    createWebhookRouter(
      pipelineConfig,
      fetchBrandPayload,
      airtableClient,
      slackClient,
      airtableBaseUrl,
    ),
  );

  // Error handler (must be last)
  app.use(errorHandler);

  return { app, policyRegistry };
}
