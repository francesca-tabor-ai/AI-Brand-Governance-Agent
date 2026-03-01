/**
 * Structured data for building Slack Block Kit messages.
 * The actual Block Kit JSON is constructed in the slack message-builder.
 */
export interface GovernanceSlackAlert {
  channel: string;
  severity: "critical" | "warning" | "info";
  documentName: string;
  exportedBy: string;
  brand: string;
  market: string;
  score: number;
  decision: string;
  reason: string;
  /** Top violations (up to 5) */
  violations: Array<{
    ruleId: string;
    message: string;
    severity: string;
  }>;
  actions: SlackActionButton[];
  /** Deep link to Airtable governance record */
  airtableUrl: string;
}

export interface SlackActionButton {
  actionId: string;
  text: string;
  style: "primary" | "danger" | undefined;
  /** Value passed back when clicked (usually recordId) */
  value: string;
}
