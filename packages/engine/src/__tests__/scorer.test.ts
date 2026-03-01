import { computeScore } from "../scoring/scorer.js";
import type { CheckResult } from "@brand-governance/shared";
import { CheckCategory, Severity } from "@brand-governance/shared";

function makeResult(
  passed: boolean,
  category: CheckCategory,
  severity: Severity = Severity.Soft,
): CheckResult {
  return {
    ruleId: `test.${category}`,
    category,
    passed,
    severity,
    message: passed ? "Passed" : "Failed",
    elementRef: "document",
  };
}

describe("computeScore", () => {
  it("returns 100 when all checks pass", () => {
    const results: CheckResult[] = [
      makeResult(true, CheckCategory.Dimensions),
      makeResult(true, CheckCategory.ColorPalette),
      makeResult(true, CheckCategory.LogoCompliance),
    ];

    const score = computeScore(results);
    expect(score.overall).toBe(100);
    expect(score.passed).toBe(3);
    expect(score.failed).toBe(0);
    expect(score.hardViolations).toBe(0);
  });

  it("returns a low score when all checks fail", () => {
    const results: CheckResult[] = [
      makeResult(false, CheckCategory.Dimensions),
      makeResult(false, CheckCategory.ColorPalette),
      makeResult(false, CheckCategory.LogoCompliance),
    ];

    const score = computeScore(results);
    expect(score.overall).toBe(0);
    expect(score.passed).toBe(0);
    expect(score.failed).toBe(3);
  });

  it("counts hard violations separately", () => {
    const results: CheckResult[] = [
      makeResult(true, CheckCategory.Dimensions),
      makeResult(false, CheckCategory.LogoCompliance, Severity.Hard),
      makeResult(false, CheckCategory.Disclaimer, Severity.Hard),
      makeResult(false, CheckCategory.Typography, Severity.Soft),
    ];

    const score = computeScore(results);
    expect(score.hardViolations).toBe(2);
    expect(score.softViolations).toBe(1);
  });

  it("handles empty results", () => {
    const score = computeScore([]);
    expect(score.overall).toBe(100);
    expect(score.totalChecks).toBe(0);
  });

  it("computes weighted category scores", () => {
    // Logo (weight 1.0) fails, dimensions (weight 0.8) passes
    const results: CheckResult[] = [
      makeResult(true, CheckCategory.Dimensions),
      makeResult(false, CheckCategory.LogoCompliance),
    ];

    const score = computeScore(results);
    // Dimensions: 100 * 0.8 = 80
    // Logo: 0 * 1.0 = 0
    // Overall: 80 / 1.8 = 44.44
    expect(score.overall).toBeCloseTo(44.44, 1);
  });

  it("provides per-category breakdowns", () => {
    const results: CheckResult[] = [
      makeResult(true, CheckCategory.Dimensions),
      makeResult(true, CheckCategory.Dimensions),
      makeResult(false, CheckCategory.ColorPalette),
    ];

    const score = computeScore(results);
    const dimCategory = score.categories.find(
      (c) => c.category === CheckCategory.Dimensions,
    );
    const colorCategory = score.categories.find(
      (c) => c.category === CheckCategory.ColorPalette,
    );

    expect(dimCategory?.score).toBe(100);
    expect(dimCategory?.checkCount).toBe(2);
    expect(dimCategory?.passedCount).toBe(2);
    expect(colorCategory?.score).toBe(0);
    expect(colorCategory?.checkCount).toBe(1);
  });
});
