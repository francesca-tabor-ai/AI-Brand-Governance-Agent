import { Router } from "express";
import type { PolicyRegistry } from "@brand-governance/engine";
import type { AppConfig } from "../config.js";

export function createHealthRouter(
  config: AppConfig,
  policyRegistry: PolicyRegistry,
): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      version: "0.1.0",
      phase: config.phase,
      policySets: policyRegistry.getAll().length,
      totalRules: policyRegistry.ruleCount,
      integrations: {
        airtable: !!config.airtable.apiKey,
        slack: !!config.slack.botToken,
      },
    });
  });

  return router;
}
