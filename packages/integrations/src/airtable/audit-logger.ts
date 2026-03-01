import type { AirtableClient } from "./client.js";
import { TABLES } from "./tables.js";

export interface AuditEntry {
  eventType: string;
  recordId: string;
  user: string;
  action: string;
  detail: string;
  beforeValue?: string;
  afterValue?: string;
}

/**
 * Append an immutable audit log entry to the Audit Log table.
 */
export async function logAuditEntry(
  client: AirtableClient,
  entry: AuditEntry,
): Promise<string> {
  return client.create(TABLES.AUDIT_LOG, {
    Timestamp: new Date().toISOString(),
    "Event Type": entry.eventType,
    "Record ID": entry.recordId,
    User: entry.user,
    Action: entry.action,
    Detail: entry.detail,
    "Before Value": entry.beforeValue ?? "",
    "After Value": entry.afterValue ?? "",
  });
}
