import type {
  GovernanceRecord,
  GovernanceSlackAlert,
} from "@brand-governance/shared";
import { Decision } from "@brand-governance/shared";

/**
 * Build a GovernanceSlackAlert from a GovernanceRecord,
 * routing to the correct channel by severity.
 */
export function buildSlackAlert(
  record: GovernanceRecord,
  airtableBaseUrl: string,
): GovernanceSlackAlert | null {
  if (!record.decision.notifySlack) return null;

  const severity = record.decision.slackSeverity ?? "info";

  const violations = record.checkResults
    .filter((r) => !r.passed)
    .map((r) => ({
      ruleId: r.ruleId,
      message: r.message,
      severity: r.severity,
    }));

  const actions = buildActions(record);

  const airtableUrl = record.airtableRecordId
    ? `${airtableBaseUrl}/${record.airtableRecordId}`
    : airtableBaseUrl;

  return {
    channel: "", // Set by the SlackClient based on severity
    severity,
    documentName: record.exportEvent.document.name,
    exportedBy: record.exportEvent.user.name,
    brand: record.exportEvent.context.brandName,
    market: record.exportEvent.context.market,
    score: record.score.overall,
    decision: record.decision.outcome,
    reason: record.decision.reason,
    violations,
    actions,
    airtableUrl,
  };
}

function buildActions(
  record: GovernanceRecord,
): GovernanceSlackAlert["actions"] {
  const actions: GovernanceSlackAlert["actions"] = [];
  const recordId = record.recordId;

  switch (record.decision.outcome) {
    case Decision.Rejected:
    case Decision.Escalated:
      actions.push({
        actionId: "governance_approve",
        text: "Approve Exception",
        style: "primary",
        value: recordId,
      });
      actions.push({
        actionId: "governance_reject",
        text: "Confirm Reject",
        style: "danger",
        value: recordId,
      });
      actions.push({
        actionId: "governance_request_fix",
        text: "Request Fix",
        style: undefined,
        value: recordId,
      });
      break;

    case Decision.ApprovedWithWarnings:
      actions.push({
        actionId: "governance_acknowledge",
        text: "Acknowledge",
        style: "primary",
        value: recordId,
      });
      break;

    default:
      break;
  }

  return actions;
}
