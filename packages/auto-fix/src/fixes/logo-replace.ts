import type { FixAction, FixResult } from "@brand-governance/shared";
import { FixType } from "@brand-governance/shared";

/**
 * Replace a deprecated or inactive logo with the current approved version.
 *
 * Records the replacement intent. The actual asset swap is performed
 * by the Adobe plugin or render pipeline.
 */
export function applyLogoReplace(action: FixAction): FixResult {
  const deprecatedId = action.params.deprecatedAssetId as string;

  if (!deprecatedId) {
    return {
      fixId: action.fixId,
      fixType: FixType.LogoReplace,
      success: false,
      detail: "Missing deprecated asset ID",
    };
  }

  // In a full implementation, this would look up the current active
  // logo for the same brand and return its asset ID. For now, we
  // record the intent.
  return {
    fixId: action.fixId,
    fixType: FixType.LogoReplace,
    success: true,
    detail: `Logo "${deprecatedId}" flagged for replacement with current version`,
    beforeValue: deprecatedId,
    afterValue: "(current active version)",
  };
}
