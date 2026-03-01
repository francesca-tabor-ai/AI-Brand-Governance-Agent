import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import {
  CheckCategory,
  FixType,
  deltaE,
  isBlackOrWhite,
  findNearestSwatch,
} from "@brand-governance/shared";

interface BrandSwatches {
  swatches: Array<{ tokenId: string; name: string; hexValue: string }>;
}

/**
 * Check that all document colors are within delta-E threshold
 * of the brand's approved color palette.
 */
export function checkColorPalette(
  event: ExportEvent,
  rule: PolicyRule,
  brandPayload: BrandSwatches,
): CheckResult[] {
  const results: CheckResult[] = [];
  const params = rule.params as Record<string, unknown>;
  const maxDelta = (params.maxDeltaE as number) ?? 3.0;
  const ignoreBlackWhite = (params.ignoreBlackWhite as boolean) ?? true;

  const colorsToCheck = event.extractedColors ?? [];
  const textColors = (event.textContent ?? []).map((t) => t.colorHex);
  const allColors = [...new Set([...colorsToCheck, ...textColors])];

  if (allColors.length === 0) {
    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.ColorPalette,
      passed: true,
      severity: rule.severity,
      message: "No colors to check (no color data provided)",
      elementRef: "document",
    });
    return results;
  }

  for (const hex of allColors) {
    if (ignoreBlackWhite && isBlackOrWhite(hex)) continue;

    const nearest = findNearestSwatch(hex, brandPayload.swatches);
    if (!nearest) {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.ColorPalette,
        passed: false,
        severity: rule.severity,
        message: `Color ${hex} has no brand palette to check against`,
        elementRef: "document",
      });
      continue;
    }

    const distance = nearest.distance;
    const passed = distance <= maxDelta;

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.ColorPalette,
      passed,
      severity: rule.severity,
      message: passed
        ? `Color ${hex} matches palette (delta-E ${distance.toFixed(1)})`
        : `Color ${hex} is off-palette (delta-E ${distance.toFixed(1)}, max ${maxDelta})`,
      elementRef: "document",
      detail: !passed
        ? {
            expected: nearest.hexValue,
            actual: hex,
            deviation: Math.round(distance * 100) / 100,
            deviationUnit: "delta-E",
          }
        : undefined,
      suggestedFix: !passed
        ? {
            fixType: FixType.ColorRemap,
            description: `Remap ${hex} to nearest approved swatch ${nearest.hexValue}`,
            safeToAutoApply: distance <= maxDelta * 2,
            params: { from: hex, to: nearest.hexValue },
          }
        : undefined,
    });
  }

  return results;
}
