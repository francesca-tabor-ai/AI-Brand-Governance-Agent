import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory } from "@brand-governance/shared";
import { checkDimensions } from "./checks/dimensions.js";
import { checkColorPalette } from "./checks/color-palette.js";
import { checkLogoValidation } from "./checks/logo-validation.js";
import { checkDisclaimer } from "./checks/disclaimer.js";
import { checkTypography } from "./checks/typography.js";
import { checkFileSpecs } from "./checks/file-specs.js";

/**
 * Run all applicable deterministic QA checks against an export event.
 *
 * Each check function is dispatched based on the rule's category.
 * The brandPayload is typed as `unknown` here and narrowed by each
 * check function to the fields it needs.
 */
export function runAllChecks(
  event: ExportEvent,
  rules: PolicyRule[],
  brandPayload: unknown,
): CheckResult[] {
  const results: CheckResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const checkResults = dispatchCheck(event, rule, brandPayload);
    results.push(...checkResults);
  }

  return results;
}

function dispatchCheck(
  event: ExportEvent,
  rule: PolicyRule,
  brandPayload: unknown,
): CheckResult[] {
  switch (rule.category) {
    case CheckCategory.Dimensions:
      return checkDimensions(event, rule);

    case CheckCategory.ColorPalette:
      return checkColorPalette(
        event,
        rule,
        brandPayload as { swatches: Array<{ tokenId: string; name: string; hexValue: string }> },
      );

    case CheckCategory.LogoCompliance:
      return checkLogoValidation(
        event,
        rule,
        brandPayload as {
          logos: Array<{
            assetId: string;
            assetType: string;
            allowedMarkets: string[];
            status: string;
          }>;
        },
      );

    case CheckCategory.Disclaimer:
      return checkDisclaimer(
        event,
        rule,
        brandPayload as {
          disclaimers: Array<{
            disclaimerId: string;
            disclaimerText: string;
            disclaimerType: string;
            marketLocales: string[];
            version: string;
            status: string;
          }>;
        },
      );

    case CheckCategory.Typography:
      return checkTypography(
        event,
        rule,
        brandPayload as {
          typography: Array<{
            tokenId: string;
            name: string;
            fontFamily: string;
            fontWeight: string;
          }>;
        },
      );

    case CheckCategory.FileSpecs:
      return checkFileSpecs(event, rule);

    // AI categories — not handled by deterministic QA
    case CheckCategory.CopyTone:
    case CheckCategory.ClaimsReview:
    case CheckCategory.VisualDrift:
      return [];

    default:
      return [];
  }
}
