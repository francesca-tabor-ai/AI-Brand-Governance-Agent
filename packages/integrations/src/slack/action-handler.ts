import type { AirtableClient } from "../airtable/client.js";
import { updateGovernanceStatus } from "../airtable/governance-table.js";
import { logAuditEntry } from "../airtable/audit-logger.js";

export interface SlackAction {
  actionId: string;
  value: string; // recordId
  userId: string;
  userName: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  newStatus: string;
}

/**
 * Handle Slack interactive button clicks (approve/reject/fix).
 * Updates Airtable and logs audit trail.
 */
export async function handleSlackAction(
  action: SlackAction,
  airtableClient: AirtableClient,
  airtableRecordId: string,
): Promise<ActionResult> {
  switch (action.actionId) {
    case "governance_approve": {
      await updateGovernanceStatus(
        airtableClient,
        airtableRecordId,
        "Approved",
        action.userName,
        "Exception approved via Slack",
      );
      await logAuditEntry(airtableClient, {
        eventType: "governance.exception_approved",
        recordId: action.value,
        user: action.userName,
        action: "approve_exception",
        detail: `Exception approved by ${action.userName} via Slack`,
      });
      return {
        success: true,
        message: `Exception approved by ${action.userName}`,
        newStatus: "Approved",
      };
    }

    case "governance_reject": {
      await updateGovernanceStatus(
        airtableClient,
        airtableRecordId,
        "Rejected",
        action.userName,
        "Rejection confirmed via Slack",
      );
      await logAuditEntry(airtableClient, {
        eventType: "governance.rejection_confirmed",
        recordId: action.value,
        user: action.userName,
        action: "confirm_rejection",
        detail: `Rejection confirmed by ${action.userName} via Slack`,
      });
      return {
        success: true,
        message: `Rejection confirmed by ${action.userName}`,
        newStatus: "Rejected",
      };
    }

    case "governance_request_fix": {
      await updateGovernanceStatus(
        airtableClient,
        airtableRecordId,
        "Under Review",
        action.userName,
        "Fix requested via Slack",
      );
      await logAuditEntry(airtableClient, {
        eventType: "governance.fix_requested",
        recordId: action.value,
        user: action.userName,
        action: "request_fix",
        detail: `Fix requested by ${action.userName} via Slack`,
      });
      return {
        success: true,
        message: `Fix requested by ${action.userName}`,
        newStatus: "Under Review",
      };
    }

    case "governance_acknowledge": {
      await logAuditEntry(airtableClient, {
        eventType: "governance.warnings_acknowledged",
        recordId: action.value,
        user: action.userName,
        action: "acknowledge_warnings",
        detail: `Warnings acknowledged by ${action.userName} via Slack`,
      });
      return {
        success: true,
        message: `Warnings acknowledged by ${action.userName}`,
        newStatus: "Approved",
      };
    }

    default:
      return {
        success: false,
        message: `Unknown action: ${action.actionId}`,
        newStatus: "Pending",
      };
  }
}
