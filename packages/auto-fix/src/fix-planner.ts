import * as crypto from "node:crypto";
import type { CheckResult, FixAction } from "@brand-governance/shared";

/**
 * Analyze failed check results and plan which fixes can be
 * safely auto-applied.
 */
export function planFixes(failedResults: CheckResult[]): FixAction[] {
  const actions: FixAction[] = [];

  for (const result of failedResults) {
    if (!result.suggestedFix) continue;
    if (!result.suggestedFix.safeToAutoApply) continue;

    actions.push({
      fixId: crypto.randomUUID(),
      fixType: result.suggestedFix.fixType,
      ruleId: result.ruleId,
      elementRef: result.elementRef,
      description: result.suggestedFix.description,
      params: result.suggestedFix.params,
    });
  }

  return actions;
}
