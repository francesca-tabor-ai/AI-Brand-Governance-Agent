import type { FixAction, FixResult } from "@brand-governance/shared";
import { FixType } from "@brand-governance/shared";

/**
 * Insert a missing disclaimer into the document.
 *
 * Records the insertion intent. The actual text placement is
 * performed by the Adobe plugin (into a designated disclaimer frame)
 * or the template engine (into the disclaimer slot).
 */
export function applyDisclaimerInsert(action: FixAction): FixResult {
  const disclaimerId = action.params.disclaimerId as string;
  const text = action.params.text as string;

  if (!disclaimerId || !text) {
    return {
      fixId: action.fixId,
      fixType: FixType.DisclaimerInsert,
      success: false,
      detail: "Missing disclaimer ID or text",
    };
  }

  return {
    fixId: action.fixId,
    fixType: FixType.DisclaimerInsert,
    success: true,
    detail: `Disclaimer "${disclaimerId}" queued for insertion`,
    beforeValue: "(missing)",
    afterValue: text.substring(0, 100),
  };
}
