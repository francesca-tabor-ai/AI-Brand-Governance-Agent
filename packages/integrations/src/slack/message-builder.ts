import type { KnownBlock } from "@slack/web-api";
import type { GovernanceSlackAlert } from "@brand-governance/shared";

const SEVERITY_EMOJI: Record<string, string> = {
  critical: ":red_circle:",
  warning: ":large_yellow_circle:",
  info: ":large_blue_circle:",
};

/**
 * Build Slack Block Kit blocks from a GovernanceSlackAlert.
 */
export function buildGovernanceMessage(
  alert: GovernanceSlackAlert,
): KnownBlock[] {
  const emoji = SEVERITY_EMOJI[alert.severity] ?? ":white_circle:";
  const blocks: KnownBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${emoji} Brand Governance Alert`,
    },
  });

  // Summary section
  blocks.push({
    type: "section",
    fields: [
      { type: "mrkdwn", text: `*Document:*\n${alert.documentName}` },
      { type: "mrkdwn", text: `*Exported By:*\n${alert.exportedBy}` },
      { type: "mrkdwn", text: `*Brand:*\n${alert.brand}` },
      { type: "mrkdwn", text: `*Market:*\n${alert.market}` },
      { type: "mrkdwn", text: `*Score:*\n${alert.score}/100` },
      { type: "mrkdwn", text: `*Decision:*\n${alert.decision}` },
    ],
  });

  // Reason
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Reason:* ${alert.reason}`,
    },
  });

  // Violations (up to 5)
  if (alert.violations.length > 0) {
    blocks.push({ type: "divider" });

    const violationText = alert.violations
      .slice(0, 5)
      .map((v) => `• *[${v.severity}]* \`${v.ruleId}\`: ${v.message}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Violations:*\n${violationText}`,
      },
    });

    if (alert.violations.length > 5) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_...and ${alert.violations.length - 5} more violation(s)_`,
          },
        ],
      });
    }
  }

  // Airtable link
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `<${alert.airtableUrl}|View in Airtable>`,
    },
  });

  // Action buttons
  if (alert.actions.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "actions",
      elements: alert.actions.map((action) => ({
        type: "button" as const,
        text: { type: "plain_text" as const, text: action.text },
        action_id: action.actionId,
        value: action.value,
        ...(action.style ? { style: action.style } : {}),
      })),
    });
  }

  return blocks;
}

/**
 * Build a fallback plain-text summary for notification previews.
 */
export function buildFallbackText(alert: GovernanceSlackAlert): string {
  return `Brand Governance: "${alert.documentName}" scored ${alert.score}/100 — ${alert.decision}. ${alert.reason}`;
}
