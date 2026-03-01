import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory, FixType } from "@brand-governance/shared";

interface BrandLogos {
  logos: Array<{
    assetId: string;
    assetType: string;
    allowedMarkets: string[];
    status: string;
  }>;
}

/**
 * Validate placed logo assets against the brand's approved logo library.
 * Checks: logo exists in library, is active, is allowed for market.
 */
export function checkLogoValidation(
  event: ExportEvent,
  rule: PolicyRule,
  brandPayload: BrandLogos,
): CheckResult[] {
  const results: CheckResult[] = [];
  const params = rule.params as Record<string, unknown>;
  const checkVersion = (params.checkVersion as boolean) ?? true;
  const checkStatus = (params.checkStatus as boolean) ?? true;
  const checkMarket = (params.checkMarketAllowed as boolean) ?? false;

  const placedLogos = (event.placedAssets ?? []).filter(
    (a) => a.assetType === "logo",
  );

  if (placedLogos.length === 0) {
    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.LogoCompliance,
      passed: true,
      severity: rule.severity,
      message: "No logo assets placed in document",
      elementRef: "document",
    });
    return results;
  }

  for (const placed of placedLogos) {
    // Check if asset ID is recognized
    if (!placed.assetId) {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.LogoCompliance,
        passed: false,
        severity: rule.severity,
        message: `Logo in "${placed.elementRef}" has no asset ID — cannot verify version`,
        elementRef: placed.elementRef,
      });
      continue;
    }

    const brandLogo = brandPayload.logos.find(
      (l) => l.assetId === placed.assetId,
    );

    if (!brandLogo) {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.LogoCompliance,
        passed: false,
        severity: rule.severity,
        message: `Logo "${placed.assetId}" not found in brand library`,
        elementRef: placed.elementRef,
        detail: { expected: "recognized asset ID", actual: placed.assetId },
      });
      continue;
    }

    // Status check (must be active, not deprecated/expired)
    if (checkStatus && brandLogo.status !== "active") {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.LogoCompliance,
        passed: false,
        severity: rule.severity,
        message: `Logo "${placed.assetId}" has status "${brandLogo.status}" (must be active)`,
        elementRef: placed.elementRef,
        detail: { expected: "active", actual: brandLogo.status },
        suggestedFix: {
          fixType: FixType.LogoReplace,
          description: `Replace ${brandLogo.status} logo with current active version`,
          safeToAutoApply: false,
          params: { deprecatedAssetId: placed.assetId },
        },
      });
      continue;
    }

    // Market restriction check
    if (checkMarket && brandLogo.allowedMarkets.length > 0) {
      const marketAllowed = brandLogo.allowedMarkets.includes(
        event.context.market,
      );
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.LogoCompliance,
        passed: marketAllowed,
        severity: rule.severity,
        message: marketAllowed
          ? `Logo "${placed.assetId}" is approved for market ${event.context.market}`
          : `Logo "${placed.assetId}" is not approved for market ${event.context.market}`,
        elementRef: placed.elementRef,
        detail: !marketAllowed
          ? {
              expected: event.context.market,
              actual: brandLogo.allowedMarkets.join(", "),
            }
          : undefined,
      });
    } else if (checkVersion) {
      // Logo passes all checks
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.LogoCompliance,
        passed: true,
        severity: rule.severity,
        message: `Logo "${placed.assetId}" is approved and active`,
        elementRef: placed.elementRef,
      });
    }
  }

  return results;
}
