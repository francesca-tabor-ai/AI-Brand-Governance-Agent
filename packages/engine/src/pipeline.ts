import * as crypto from "node:crypto";
import type {
  ExportEvent,
  GovernanceRecord,
  CheckResult,
  PolicyRule,
} from "@brand-governance/shared";
import { GovernancePhase } from "@brand-governance/shared";
import type { PolicyRegistry } from "./policy/policy-registry.js";
import { matchRules } from "./policy/policy-matcher.js";
import { computeScore } from "./scoring/scorer.js";
import { makeDecision } from "./decision/decision-engine.js";

/**
 * Context required by the QA runner and fix service.
 * These are injected so the pipeline stays decoupled from
 * specific check and fix implementations.
 */
export interface CheckRunner {
  runChecks(
    event: ExportEvent,
    rules: PolicyRule[],
    brandPayload: unknown,
  ): Promise<CheckResult[]>;
}

export interface FixService {
  applyFixes(
    event: ExportEvent,
    results: CheckResult[],
    brandPayload: unknown,
  ): Promise<{ fixedResults: CheckResult[]; fixCount: number }>;
}

export interface PipelineConfig {
  phase: GovernancePhase;
  policyRegistry: PolicyRegistry;
  checkRunner: CheckRunner;
  fixService?: FixService;
}

/**
 * Top-level governance pipeline orchestrator.
 *
 * Flow: receive event -> match policies -> run checks -> score ->
 *       optionally fix -> re-score if fixed -> decide -> return record.
 */
export async function evaluateExport(
  event: ExportEvent,
  brandPayload: unknown,
  config: PipelineConfig,
): Promise<GovernanceRecord> {
  const recordId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // 1. Match applicable policy rules
  const policySets = config.policyRegistry.getAll();
  const rules = matchRules(
    policySets,
    event.context,
    event.output.format,
    event.document.application,
  );

  // 2. Run deterministic QA checks (and AI checks when available)
  let checkResults = await config.checkRunner.runChecks(
    event,
    rules,
    brandPayload,
  );

  // 3. Attempt auto-fixes (Phase 2+)
  let fixCount = 0;
  const fixActions: GovernanceRecord["fixActions"] = [];
  const fixResults: GovernanceRecord["fixResults"] = [];

  if (
    config.fixService &&
    config.phase !== GovernancePhase.Observe &&
    checkResults.some((r) => !r.passed && r.suggestedFix?.safeToAutoApply)
  ) {
    const fixOutcome = await config.fixService.applyFixes(
      event,
      checkResults,
      brandPayload,
    );
    checkResults = fixOutcome.fixedResults;
    fixCount = fixOutcome.fixCount;
  }

  // 4. Compute compliance score
  const score = computeScore(checkResults);

  // 5. Make governance decision
  const decision = makeDecision(score, checkResults, config.phase, fixCount);

  const completedAt = new Date().toISOString();

  return {
    recordId,
    createdAt,
    completedAt,
    phase: config.phase,
    exportEvent: event,
    checkResults,
    score,
    fixActions,
    fixResults,
    decision,
    airtableRecordId: null,
  };
}
