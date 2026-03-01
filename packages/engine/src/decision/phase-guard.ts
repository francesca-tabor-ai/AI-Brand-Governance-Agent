import type { GovernanceDecision } from "@brand-governance/shared";
import { Decision, GovernancePhase } from "@brand-governance/shared";

/**
 * Soften a governance decision based on the current rollout phase.
 *
 * The decision engine always computes the "full enforcement" result.
 * The phase guard then adjusts it:
 *
 *   Observe: Always approve (but preserve the computed data for logging)
 *   Warn:    Convert rejects to warnings, keep escalations
 *   Enforce: Full enforcement (no changes)
 *   Autonomous: Full enforcement (no changes)
 */
export function applyPhaseGuard(
  decision: GovernanceDecision,
  phase: GovernancePhase,
): GovernanceDecision {
  switch (phase) {
    case GovernancePhase.Observe:
      return {
        ...decision,
        outcome: Decision.Approved,
        reason: `[Observe mode] ${decision.reason}`,
        notifySlack: false,
      };

    case GovernancePhase.Warn:
      if (
        decision.outcome === Decision.Rejected ||
        decision.outcome === Decision.Escalated
      ) {
        return {
          ...decision,
          outcome: Decision.ApprovedWithWarnings,
          reason: `[Warn mode] ${decision.reason}`,
          slackSeverity: "warning",
        };
      }
      return decision;

    case GovernancePhase.Enforce:
    case GovernancePhase.Autonomous:
      return decision;
  }
}
