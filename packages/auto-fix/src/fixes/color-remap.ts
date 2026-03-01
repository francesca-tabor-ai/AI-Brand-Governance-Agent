import type { FixAction, FixResult } from "@brand-governance/shared";
import { FixType } from "@brand-governance/shared";

/**
 * Remap an off-palette color to the nearest approved swatch.
 *
 * This records the mapping intent. The actual pixel/swatch replacement
 * is performed by the Adobe plugin (client-side) or the render pipeline
 * (server-side) using the returned parameters.
 */
export function applyColorRemap(action: FixAction): FixResult {
  const from = action.params.from as string;
  const to = action.params.to as string;

  if (!from || !to) {
    return {
      fixId: action.fixId,
      fixType: FixType.ColorRemap,
      success: false,
      detail: "Missing 'from' or 'to' color parameters",
    };
  }

  return {
    fixId: action.fixId,
    fixType: FixType.ColorRemap,
    success: true,
    detail: `Color remapped from ${from} to ${to}`,
    beforeValue: from,
    afterValue: to,
  };
}
