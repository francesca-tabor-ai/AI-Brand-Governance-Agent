import type {
  CheckResult,
  ComplianceScore,
  CategoryScore,
} from "@brand-governance/shared";
import { CheckCategory, Severity } from "@brand-governance/shared";
import { DEFAULT_CATEGORY_WEIGHTS } from "./weights.js";

/**
 * Compute a 0-100 compliance score from a list of check results.
 *
 * Algorithm:
 *   1. Group results by category.
 *   2. Per category: score = (passedCount / totalCount) * 100
 *   3. Overall = weighted average of category scores.
 *   4. Hard violations are tracked separately (they trigger
 *      rejection regardless of score).
 */
export function computeScore(
  results: CheckResult[],
  categoryWeights: Record<CheckCategory, number> = DEFAULT_CATEGORY_WEIGHTS,
): ComplianceScore {
  const grouped = groupByCategory(results);
  const categories: CategoryScore[] = [];

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, checks] of grouped) {
    const weight = categoryWeights[category] ?? 0.5;
    const passedCount = checks.filter((c) => c.passed).length;
    const score = checks.length > 0 ? (passedCount / checks.length) * 100 : 100;
    const weightedScore = score * weight;

    categories.push({
      category,
      score: Math.round(score * 100) / 100,
      weight,
      weightedScore: Math.round(weightedScore * 100) / 100,
      checkCount: checks.length,
      passedCount,
    });

    weightedSum += weightedScore;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? weightedSum / totalWeight : 100;

  const hardViolations = results.filter(
    (r) => !r.passed && r.severity === Severity.Hard,
  ).length;
  const softViolations = results.filter(
    (r) => !r.passed && r.severity === Severity.Soft,
  ).length;
  const infoFindings = results.filter(
    (r) => !r.passed && r.severity === Severity.Info,
  ).length;

  return {
    overall: Math.round(overall * 100) / 100,
    categories,
    totalChecks: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    hardViolations,
    softViolations,
    infoFindings,
  };
}

function groupByCategory(
  results: CheckResult[],
): Map<CheckCategory, CheckResult[]> {
  const map = new Map<CheckCategory, CheckResult[]>();

  for (const result of results) {
    const existing = map.get(result.category) || [];
    existing.push(result);
    map.set(result.category, existing);
  }

  return map;
}
