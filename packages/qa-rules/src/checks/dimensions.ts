import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory } from "@brand-governance/shared";

/**
 * Check DPI, dimensions, and bleed against policy parameters.
 */
export function checkDimensions(
  event: ExportEvent,
  rule: PolicyRule,
): CheckResult[] {
  const results: CheckResult[] = [];
  const { output, context } = event;
  const params = rule.params as Record<string, unknown>;

  // Min DPI check
  if (params.minDpiByChannel) {
    const dpiMap = params.minDpiByChannel as Record<string, number>;
    const minDpi = dpiMap[context.channel] ?? dpiMap["default"] ?? 72;

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Dimensions,
      passed: output.dpi >= minDpi,
      severity: rule.severity,
      message:
        output.dpi >= minDpi
          ? `DPI ${output.dpi} meets minimum ${minDpi} for ${context.channel}`
          : `DPI ${output.dpi} is below minimum ${minDpi} for ${context.channel}`,
      elementRef: "document",
      detail: output.dpi < minDpi
        ? {
            expected: minDpi,
            actual: output.dpi,
            deviation: minDpi - output.dpi,
            deviationUnit: "dpi",
          }
        : undefined,
    });
  }

  // Max dimensions check
  if (params.maxWidthPx || params.maxHeightPx) {
    const maxW = (params.maxWidthPx as number) ?? Infinity;
    const maxH = (params.maxHeightPx as number) ?? Infinity;
    const withinBounds = output.widthPx <= maxW && output.heightPx <= maxH;

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Dimensions,
      passed: withinBounds,
      severity: rule.severity,
      message: withinBounds
        ? `Dimensions ${output.widthPx}x${output.heightPx} within limits`
        : `Dimensions ${output.widthPx}x${output.heightPx} exceed max ${maxW}x${maxH}`,
      elementRef: "document",
      detail: !withinBounds
        ? {
            expected: `${maxW}x${maxH}`,
            actual: `${output.widthPx}x${output.heightPx}`,
          }
        : undefined,
    });
  }

  // Bleed check
  if (params.minBleedPt != null) {
    const minBleed = params.minBleedPt as number;
    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Dimensions,
      passed: output.bleedPt >= minBleed,
      severity: rule.severity,
      message:
        output.bleedPt >= minBleed
          ? `Bleed ${output.bleedPt}pt meets minimum ${minBleed}pt`
          : `Bleed ${output.bleedPt}pt is below minimum ${minBleed}pt`,
      elementRef: "document",
      detail: output.bleedPt < minBleed
        ? {
            expected: minBleed,
            actual: output.bleedPt,
            deviation: minBleed - output.bleedPt,
            deviationUnit: "pt",
          }
        : undefined,
    });
  }

  return results;
}
