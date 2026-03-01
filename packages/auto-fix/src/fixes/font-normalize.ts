import type { FixAction, FixResult } from "@brand-governance/shared";
import { FixType } from "@brand-governance/shared";

/**
 * Replace an unapproved font with the approved fallback.
 *
 * Records the font swap intent. The actual font change is performed
 * by the Adobe plugin or render pipeline.
 */
export function applyFontNormalize(action: FixAction): FixResult {
  const from = action.params.from as string;
  const to = action.params.to as string;

  if (!from || !to) {
    return {
      fixId: action.fixId,
      fixType: FixType.FontNormalize,
      success: false,
      detail: "Missing 'from' or 'to' font parameters",
    };
  }

  return {
    fixId: action.fixId,
    fixType: FixType.FontNormalize,
    success: true,
    detail: `Font normalized from "${from}" to "${to}"`,
    beforeValue: from,
    afterValue: to,
  };
}
