import { Router } from "express";
import { evaluateExport } from "@brand-governance/engine";
import type { PipelineConfig } from "@brand-governance/engine";
import {
  parseExportEvent,
  buildGateResponse,
  buildSlackAlert,
  buildGovernanceMessage,
  buildFallbackText,
  createGovernanceReview,
  logAuditEntry,
  handleSlackAction,
} from "@brand-governance/integrations";
import type { AirtableClient, SlackClient } from "@brand-governance/integrations";

/**
 * Webhook routes for Adobe plugin exports and Slack interactions.
 */
export function createWebhookRouter(
  pipelineConfig: PipelineConfig,
  fetchBrandPayload: (brandId: string) => Promise<unknown>,
  airtableClient: AirtableClient | null,
  slackClient: SlackClient | null,
  airtableBaseUrl: string,
): Router {
  const router = Router();

  /**
   * POST /webhooks/adobe/export
   * Main entry point: Adobe plugin sends export events here.
   */
  router.post("/webhooks/adobe/export", async (req, res, next) => {
    try {
      const parsed = parseExportEvent(req.body);

      if (!parsed.valid) {
        res.status(400).json({
          error: "Invalid export event",
          details: parsed.errors,
        });
        return;
      }

      // Run governance pipeline
      const brandPayload = await fetchBrandPayload(
        parsed.event.context.brandId,
      );

      const record = await evaluateExport(
        parsed.event,
        brandPayload,
        pipelineConfig,
      );

      // Persist to Airtable (non-blocking)
      if (airtableClient) {
        try {
          const airtableId = await createGovernanceReview(
            airtableClient,
            record,
          );
          record.airtableRecordId = airtableId;

          await logAuditEntry(airtableClient, {
            eventType: "governance.evaluation_completed",
            recordId: record.recordId,
            user: parsed.event.user.email,
            action: "evaluate",
            detail: `Score: ${record.score.overall}, Decision: ${record.decision.outcome}`,
          });
        } catch (err) {
          console.error("[Airtable] Failed to persist governance record:", err);
        }
      }

      // Send Slack notification (non-blocking)
      if (slackClient) {
        try {
          const alert = buildSlackAlert(record, airtableBaseUrl);
          if (alert) {
            const channel = slackClient.getChannel(alert.severity);
            alert.channel = channel;
            const blocks = buildGovernanceMessage(alert);
            const text = buildFallbackText(alert);
            await slackClient.postMessage(channel, blocks, text);
          }
        } catch (err) {
          console.error("[Slack] Failed to send notification:", err);
        }
      }

      // Respond to plugin
      const gateResponse = buildGateResponse(record);
      res.json(gateResponse);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /webhooks/slack/actions
   * Handle Slack interactive button clicks.
   */
  router.post("/webhooks/slack/actions", async (req, res, next) => {
    try {
      const payload = JSON.parse(req.body.payload ?? "{}");
      const action = payload.actions?.[0];
      const user = payload.user;

      if (!action || !airtableClient) {
        res.status(200).json({ text: "No action to process" });
        return;
      }

      // Look up the Airtable record ID from the governance record ID
      const records = await airtableClient.find(
        "Governance Reviews",
        `{Record ID} = "${action.value}"`,
        1,
      );

      if (records.length === 0) {
        res.status(200).json({ text: "Governance record not found" });
        return;
      }

      const result = await handleSlackAction(
        {
          actionId: action.action_id,
          value: action.value,
          userId: user?.id ?? "",
          userName: user?.name ?? "Unknown",
        },
        airtableClient,
        records[0].id,
      );

      res.status(200).json({
        response_type: "in_channel",
        text: result.message,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
