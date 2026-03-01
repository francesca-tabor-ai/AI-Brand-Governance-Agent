import type {
  ComplianceScore,
  CheckResult,
  GovernanceDecision,
} from "@brand-governance/shared";
import {
  Decision,
  GovernancePhase,
  Severity,
  SCORE_APPROVED,
  SCORE_ESCALATE,
} from "@brand-governance/shared";
import { applyPhaseGuard } from "./phase-guard.js";

/**
 * Determine the governance decision for an export based on its
 * compliance score and check results.
 *
 * Always computes the "full enforcement" decision first, then
 * applies the phase guard to soften it if needed.
 */
export function makeDecision(
  score: ComplianceScore,
  results: CheckResult[],
  phase: GovernancePhase,
  fixesApplied: number = 0,
): GovernanceDecision {
  // Compute the raw (full enforcement) decision
  const raw = computeRawDecision(score, results, fixesApplied);

  // Apply phase guard
  return applyPhaseGuard(raw, phase);
}

function computeRawDecision(
  score: ComplianceScore,
  results: CheckResult[],
  fixesApplied: number,
): GovernanceDecision {
  const hardViolations = results.filter(
    (r) => !r.passed && r.severity === Severity.Hard,
  );
  const blockingIds = hardViolations.map((r) => r.ruleId);

  // Hard violations always reject regardless of score
  if (hardViolations.length > 0) {
    return {
      outcome: Decision.Rejected,
      reason: `${hardViolations.length} hard violation(s): ${blockingIds.join(", ")}`,
      blockingViolations: blockingIds,
      notifySlack: true,
      slackSeverity: "critical",
    };
  }

  // Auto-fixed: all violations were resolved
  if (fixesApplied > 0 && score.failed === 0) {
    return {
      outcome: Decision.AutoFixed,
      reason: `${fixesApplied} issue(s) auto-fixed, all checks now pass`,
      blockingViolations: [],
      fixesSummary: `${fixesApplied} fix(es) applied`,
      notifySlack: true,
      slackSeverity: "info",
    };
  }

  // Score-based thresholds
  if (score.overall >= SCORE_APPROVED) {
    const hasWarnings = score.softViolations > 0 || score.infoFindings > 0;
    return {
      outcome: hasWarnings ? Decision.ApprovedWithWarnings : Decision.Approved,
      reason: hasWarnings
        ? `Score ${score.overall} (approved with ${score.softViolations} warning(s))`
        : `Score ${score.overall} (approved)`,
      blockingViolations: [],
      notifySlack: hasWarnings,
      slackSeverity: hasWarnings ? "info" : undefined,
    };
  }

  if (score.overall >= SCORE_ESCALATE) {
    return {
      outcome: Decision.Escalated,
      reason: `Score ${score.overall} (below ${SCORE_APPROVED}, needs review)`,
      blockingViolations: [],
      escalateTo: ["brand_ops"],
      notifySlack: true,
      slackSeverity: "warning",
    };
  }

  // Below escalation threshold
  return {
    outcome: Decision.Rejected,
    reason: `Score ${score.overall} (below ${SCORE_ESCALATE}, rejected)`,
    blockingViolations: results.filter((r) => !r.passed).map((r) => r.ruleId),
    notifySlack: true,
    slackSeverity: "critical",
  };
}
