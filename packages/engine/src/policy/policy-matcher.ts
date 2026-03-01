import type { PolicyRule, PolicySet, ExportContext } from "@brand-governance/shared";

/**
 * Filter policy rules by the export's context. A rule matches if
 * every non-empty scope array contains the export's value for that
 * dimension. Empty scope arrays match everything (no restriction).
 */
export function matchRules(
  policySets: PolicySet[],
  context: ExportContext,
  format: string,
  application: string,
): PolicyRule[] {
  const matched: PolicyRule[] = [];

  for (const set of policySets) {
    for (const rule of set.rules) {
      if (!rule.enabled) continue;
      if (ruleMatchesContext(rule, context, format, application)) {
        matched.push(rule);
      }
    }
  }

  return deduplicateRules(matched);
}

function ruleMatchesContext(
  rule: PolicyRule,
  context: ExportContext,
  format: string,
  application: string,
): boolean {
  const { scope } = rule;

  if (scope.brands.length > 0 && !scope.brands.includes(context.brandId)) {
    return false;
  }
  if (scope.markets.length > 0 && !scope.markets.includes(context.market)) {
    return false;
  }
  if (scope.channels.length > 0 && !scope.channels.includes(context.channel)) {
    return false;
  }
  if (scope.formats.length > 0 && !scope.formats.includes(format)) {
    return false;
  }
  if (scope.applications.length > 0 && !scope.applications.includes(application)) {
    return false;
  }

  return true;
}

/**
 * If the same ruleId appears in multiple policy sets (e.g. default
 * and market overlay), the later one wins (overlay overrides default).
 */
function deduplicateRules(rules: PolicyRule[]): PolicyRule[] {
  const byId = new Map<string, PolicyRule>();
  for (const rule of rules) {
    byId.set(rule.ruleId, rule);
  }
  return Array.from(byId.values());
}
