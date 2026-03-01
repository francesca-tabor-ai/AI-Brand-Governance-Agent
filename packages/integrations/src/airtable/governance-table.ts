import type { GovernanceRecord } from "@brand-governance/shared";
import type { AirtableClient } from "./client.js";
import { TABLES } from "./tables.js";

/**
 * Map a GovernanceRecord to Airtable fields and create the record.
 */
export async function createGovernanceReview(
  client: AirtableClient,
  record: GovernanceRecord,
): Promise<string> {
  const violationsSummary = record.checkResults
    .filter((r) => !r.passed)
    .map((r) => `[${r.severity}] ${r.ruleId}: ${r.message}`)
    .join("\n");

  const fixesSummary = record.fixResults
    .map((f) => `${f.fixType}: ${f.detail}`)
    .join("\n");

  const fields = {
    "Record ID": record.recordId,
    "Export Event ID": record.exportEvent.eventId,
    "Created At": record.createdAt,
    "Brand": record.exportEvent.context.brandName,
    "Market": record.exportEvent.context.market,
    "Channel": record.exportEvent.context.channel,
    "Document Name": record.exportEvent.document.name,
    "Exported By": record.exportEvent.user.name,
    "Application": record.exportEvent.document.application,
    "Format": record.exportEvent.output.format,
    "Compliance Score": record.score.overall,
    "Decision": record.decision.outcome,
    "Decision Reason": record.decision.reason,
    "Hard Violations": record.score.hardViolations,
    "Soft Violations": record.score.softViolations,
    "Auto-Fixes Applied": record.fixResults.filter((f) => f.success).length,
    "Phase": record.phase,
    "Status": mapDecisionToStatus(record.decision.outcome),
    "Reviewer": "",
    "Review Notes": "",
    "Violations Summary": violationsSummary,
    "Fixes Summary": fixesSummary,
  };

  return client.create(TABLES.GOVERNANCE_REVIEWS, fields);
}

/**
 * Update the status and reviewer of a governance review.
 */
export async function updateGovernanceStatus(
  client: AirtableClient,
  airtableRecordId: string,
  status: string,
  reviewer: string,
  notes: string,
): Promise<void> {
  await client.update(TABLES.GOVERNANCE_REVIEWS, airtableRecordId, {
    Status: status,
    Reviewer: reviewer,
    "Review Notes": notes,
  });
}

function mapDecisionToStatus(
  decision: string,
): "Pending" | "Approved" | "Rejected" | "Under Review" | "Fixed" {
  switch (decision) {
    case "approved":
    case "approved_with_warnings":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "escalated":
    case "pending_review":
      return "Under Review";
    case "auto_fixed":
      return "Fixed";
    default:
      return "Pending";
  }
}
