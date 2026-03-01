import type { Decision, GovernancePhase } from "./enums.js";
import type { ExportEvent } from "./export-event.js";
import type { CheckResult } from "./check-result.js";
import type { ComplianceScore } from "./compliance-score.js";
import type { FixAction, FixResult } from "./fix-action.js";

/**
 * Complete governance evaluation record. Represents the full lifecycle
 * of evaluating one export event. Stored in Airtable and drives
 * Slack notifications.
 */
export interface GovernanceRecord {
  recordId: string;
  createdAt: string;
  completedAt: string;

  /** Governance phase when this evaluation ran */
  phase: GovernancePhase;

  /** The export event that triggered evaluation */
  exportEvent: ExportEvent;

  /** All check results (QA + AI) */
  checkResults: CheckResult[];

  /** Computed compliance score */
  score: ComplianceScore;

  /** Auto-fix actions planned */
  fixActions: FixAction[];
  /** Results of applied fixes */
  fixResults: FixResult[];

  /** Final governance decision */
  decision: GovernanceDecision;

  /** Airtable record ID once synced (null before sync) */
  airtableRecordId: string | null;
}

/** The governance engine's decision for this export */
export interface GovernanceDecision {
  outcome: Decision;
  /** Human-readable reason for the decision */
  reason: string;
  /** If escalated: who should review */
  escalateTo?: string[];
  /** Hard violations that blocked the export */
  blockingViolations: string[];
  /** Summary of what was auto-fixed */
  fixesSummary?: string;
  /** Whether a Slack notification should be sent */
  notifySlack: boolean;
  /** Slack notification severity for channel routing */
  slackSeverity?: "critical" | "warning" | "info";
}
