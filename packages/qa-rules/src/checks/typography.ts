import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory, FixType } from "@brand-governance/shared";

interface BrandTypography {
  typography: Array<{
    tokenId: string;
    name: string;
    fontFamily: string;
    fontWeight: string;
  }>;
}

/**
 * Check that document fonts match the brand's approved typography
 * and meet minimum size requirements.
 */
export function checkTypography(
  event: ExportEvent,
  rule: PolicyRule,
  brandPayload: BrandTypography,
): CheckResult[] {
  const results: CheckResult[] = [];
  const params = rule.params as Record<string, unknown>;

  const textElements = event.textContent ?? [];
  if (textElements.length === 0) {
    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Typography,
      passed: true,
      severity: rule.severity,
      message: "No text content to check",
      elementRef: "document",
    });
    return results;
  }

  const approvedFamilies = brandPayload.typography.map((t) =>
    t.fontFamily.toLowerCase(),
  );
  const strictMatch = (params.strictMatch as boolean) ?? false;
  const minDisclaimerSize = (params.minDisclaimerSizePt as number) ?? 6;
  const minBodySize = (params.minBodySizePt as number) ?? 8;

  // Track unique font families to avoid duplicate reports
  const checkedFamilies = new Set<string>();

  for (const text of textElements) {
    const family = text.fontFamily.toLowerCase();

    // Font family check (deduplicated)
    if (!checkedFamilies.has(family)) {
      checkedFamilies.add(family);

      const isApproved = strictMatch
        ? approvedFamilies.includes(family)
        : approvedFamilies.some(
            (approved) =>
              family.includes(approved) || approved.includes(family),
          );

      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.Typography,
        passed: isApproved,
        severity: rule.severity,
        message: isApproved
          ? `Font "${text.fontFamily}" is approved`
          : `Font "${text.fontFamily}" is not in the approved typeface list`,
        elementRef: text.elementRef,
        detail: !isApproved
          ? {
              expected: approvedFamilies.join(", "),
              actual: text.fontFamily,
            }
          : undefined,
        suggestedFix: !isApproved
          ? {
              fixType: FixType.FontNormalize,
              description: `Replace "${text.fontFamily}" with approved fallback`,
              safeToAutoApply: true,
              params: {
                from: text.fontFamily,
                to: brandPayload.typography[0]?.fontFamily ?? "Arial",
              },
            }
          : undefined,
      });
    }

    // Font size check
    const minSize = isDisclaimerElement(text.elementRef)
      ? minDisclaimerSize
      : minBodySize;

    if (text.fontSizePt < minSize) {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.Typography,
        passed: false,
        severity: rule.severity,
        message: `Font size ${text.fontSizePt}pt is below minimum ${minSize}pt in "${text.elementRef}"`,
        elementRef: text.elementRef,
        detail: {
          expected: minSize,
          actual: text.fontSizePt,
          deviation: minSize - text.fontSizePt,
          deviationUnit: "pt",
        },
      });
    }
  }

  return results;
}

function isDisclaimerElement(ref: string): boolean {
  const lower = ref.toLowerCase();
  return (
    lower.includes("disclaimer") ||
    lower.includes("legal") ||
    lower.includes("footnote")
  );
}
