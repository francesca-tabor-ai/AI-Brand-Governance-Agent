import type { GovernanceRecord } from "@brand-governance/shared";
import { Decision } from "@brand-governance/shared";

/**
 * Response sent back to the Adobe plugin after governance evaluation.
 * The plugin uses this to gate the export (show/block) and display
 * results to the user.
 */
export interface GateResponse {
  approved: boolean;
  recordId: string;
  score: number;
  decision: string;
  reason: string;
  violations: Array<{
    ruleId: string;
    severity: string;
    message: string;
    fixable: boolean;
  }>;
  fixesApplied: number;
}

/**
 * Build the gate response from a GovernanceRecord.
 */
export function buildGateResponse(record: GovernanceRecord): GateResponse {
  const approved =
    record.decision.outcome === Decision.Approved ||
    record.decision.outcome === Decision.ApprovedWithWarnings ||
    record.decision.outcome === Decision.AutoFixed;

  const violations = record.checkResults
    .filter((r) => !r.passed)
    .map((r) => ({
      ruleId: r.ruleId,
      severity: r.severity,
      message: r.message,
      fixable: r.suggestedFix?.safeToAutoApply ?? false,
    }));

  return {
    approved,
    recordId: record.recordId,
    score: record.score.overall,
    decision: record.decision.outcome,
    reason: record.decision.reason,
    violations,
    fixesApplied: record.fixResults.filter((f) => f.success).length,
  };
}
