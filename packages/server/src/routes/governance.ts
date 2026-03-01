import { Router } from "express";
import { evaluateExport } from "@brand-governance/engine";
import type { PipelineConfig } from "@brand-governance/engine";
import { parseExportEvent, buildGateResponse } from "@brand-governance/integrations";

/**
 * POST /governance/evaluate
 * Manual governance evaluation endpoint. Accepts an ExportEvent body,
 * runs the full pipeline, and returns the gate response.
 */
export function createGovernanceRouter(
  pipelineConfig: PipelineConfig,
  fetchBrandPayload: (brandId: string) => Promise<unknown>,
): Router {
  const router = Router();

  router.post("/governance/evaluate", async (req, res, next) => {
    try {
      const parsed = parseExportEvent(req.body);

      if (!parsed.valid) {
        res.status(400).json({
          error: "Invalid ExportEvent payload",
          details: parsed.errors,
        });
        return;
      }

      const brandPayload = await fetchBrandPayload(
        parsed.event.context.brandId,
      );

      const record = await evaluateExport(
        parsed.event,
        brandPayload,
        pipelineConfig,
      );

      const gateResponse = buildGateResponse(record);
      res.json(gateResponse);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
