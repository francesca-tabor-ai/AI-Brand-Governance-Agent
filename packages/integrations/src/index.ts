// Airtable
export { AirtableClient, type AirtableConfig } from "./airtable/client.js";
export { TABLES } from "./airtable/tables.js";
export {
  createGovernanceReview,
  updateGovernanceStatus,
} from "./airtable/governance-table.js";
export { logAuditEntry, type AuditEntry } from "./airtable/audit-logger.js";

// Slack
export { SlackClient, type SlackConfig } from "./slack/client.js";
export {
  buildGovernanceMessage,
  buildFallbackText,
} from "./slack/message-builder.js";
export { buildSlackAlert } from "./slack/channels.js";
export {
  handleSlackAction,
  type SlackAction,
  type ActionResult,
} from "./slack/action-handler.js";

// Adobe
export { parseExportEvent } from "./adobe/event-listener.js";
export { buildGateResponse, type GateResponse } from "./adobe/gate-controller.js";
