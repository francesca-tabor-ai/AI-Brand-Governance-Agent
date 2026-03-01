import type {
  ExportEvent,
  CheckResult,
  FixResult,
} from "@brand-governance/shared";
import { FixType } from "@brand-governance/shared";
import { planFixes } from "./fix-planner.js";
import { applyColorRemap } from "./fixes/color-remap.js";
import { applyLogoReplace } from "./fixes/logo-replace.js";
import { applyDisclaimerInsert } from "./fixes/disclaimer-insert.js";
import { applyFontNormalize } from "./fixes/font-normalize.js";

export { planFixes } from "./fix-planner.js";

/**
 * Apply auto-fixes to failed check results.
 *
 * Returns updated check results (with fixed items marked as passed)
 * and the count of successful fixes.
 */
export async function applyFixes(
  _event: ExportEvent,
  results: CheckResult[],
  _brandPayload: unknown,
): Promise<{ fixedResults: CheckResult[]; fixCount: number }> {
  const failed = results.filter((r) => !r.passed);
  const fixActions = planFixes(failed);

  const fixResults: FixResult[] = [];

  for (const action of fixActions) {
    let result: FixResult;

    switch (action.fixType) {
      case FixType.ColorRemap:
        result = applyColorRemap(action);
        break;
      case FixType.LogoReplace:
        result = applyLogoReplace(action);
        break;
      case FixType.DisclaimerInsert:
        result = applyDisclaimerInsert(action);
        break;
      case FixType.FontNormalize:
        result = applyFontNormalize(action);
        break;
      default:
        result = {
          fixId: action.fixId,
          fixType: action.fixType,
          success: false,
          detail: `Unknown fix type: ${action.fixType}`,
        };
    }

    fixResults.push(result);
  }

  // Mark successfully fixed results as passed
  const fixedRuleIds = new Set(
    fixResults.filter((f) => f.success).map((f) => {
      const action = fixActions.find((a) => a.fixId === f.fixId);
      return action?.ruleId;
    }),
  );

  const fixedResults = results.map((r) => {
    if (!r.passed && fixedRuleIds.has(r.ruleId)) {
      return { ...r, passed: true, message: `${r.message} (auto-fixed)` };
    }
    return r;
  });

  return {
    fixedResults,
    fixCount: fixResults.filter((f) => f.success).length,
  };
}
