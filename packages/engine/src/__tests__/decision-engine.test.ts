import { makeDecision } from "../decision/decision-engine.js";
import type { CheckResult, ComplianceScore } from "@brand-governance/shared";
import {
  Decision,
  GovernancePhase,
  Severity,
  CheckCategory,
} from "@brand-governance/shared";

function makeScore(
  overall: number,
  hardViolations = 0,
  softViolations = 0,
): ComplianceScore {
  return {
    overall,
    categories: [],
    totalChecks: 10,
    passed: 10 - hardViolations - softViolations,
    failed: hardViolations + softViolations,
    hardViolations,
    softViolations,
    infoFindings: 0,
  };
}

function makeHardViolation(ruleId: string): CheckResult {
  return {
    ruleId,
    category: CheckCategory.LogoCompliance,
    passed: false,
    severity: Severity.Hard,
    message: `Hard violation: ${ruleId}`,
    elementRef: "document",
  };
}

function makeSoftViolation(ruleId: string): CheckResult {
  return {
    ruleId,
    category: CheckCategory.ColorPalette,
    passed: false,
    severity: Severity.Soft,
    message: `Soft violation: ${ruleId}`,
    elementRef: "document",
  };
}

describe("makeDecision", () => {
  describe("Phase: Enforce", () => {
    const phase = GovernancePhase.Enforce;

    it("approves when score >= 90 and no violations", () => {
      const decision = makeDecision(makeScore(95), [], phase);
      expect(decision.outcome).toBe(Decision.Approved);
    });

    it("approves with warnings when score >= 90 but has soft violations", () => {
      const score = makeScore(92, 0, 2);
      const results = [makeSoftViolation("color.1"), makeSoftViolation("color.2")];
      const decision = makeDecision(score, results, phase);
      expect(decision.outcome).toBe(Decision.ApprovedWithWarnings);
    });

    it("escalates when score is between 70-89", () => {
      const decision = makeDecision(makeScore(75), [], phase);
      expect(decision.outcome).toBe(Decision.Escalated);
    });

    it("rejects when score is below 70", () => {
      const results = [makeSoftViolation("test.rule")];
      const decision = makeDecision(makeScore(60), results, phase);
      expect(decision.outcome).toBe(Decision.Rejected);
    });

    it("rejects when hard violations exist regardless of score", () => {
      const score = makeScore(95, 1);
      const results = [makeHardViolation("logo.version_current")];
      const decision = makeDecision(score, results, phase);
      expect(decision.outcome).toBe(Decision.Rejected);
      expect(decision.blockingViolations).toContain("logo.version_current");
    });

    it("tests threshold boundary at 90", () => {
      const at90 = makeDecision(makeScore(90), [], phase);
      expect(at90.outcome).toBe(Decision.Approved);

      const at89 = makeDecision(makeScore(89), [], phase);
      expect(at89.outcome).toBe(Decision.Escalated);
    });

    it("tests threshold boundary at 70", () => {
      const at70 = makeDecision(makeScore(70), [], phase);
      expect(at70.outcome).toBe(Decision.Escalated);

      const results = [makeSoftViolation("test")];
      const at69 = makeDecision(makeScore(69), results, phase);
      expect(at69.outcome).toBe(Decision.Rejected);
    });
  });

  describe("Phase: Observe", () => {
    const phase = GovernancePhase.Observe;

    it("always approves regardless of score", () => {
      const decision = makeDecision(makeScore(30, 3), [
        makeHardViolation("logo.1"),
        makeHardViolation("logo.2"),
        makeHardViolation("logo.3"),
      ], phase);
      expect(decision.outcome).toBe(Decision.Approved);
    });

    it("does not send Slack notifications", () => {
      const decision = makeDecision(makeScore(30, 3), [
        makeHardViolation("logo.1"),
      ], phase);
      expect(decision.notifySlack).toBe(false);
    });

    it("prefixes reason with observe mode", () => {
      const decision = makeDecision(makeScore(50), [], phase);
      expect(decision.reason).toContain("[Observe mode]");
    });
  });

  describe("Phase: Warn", () => {
    const phase = GovernancePhase.Warn;

    it("converts rejections to warnings", () => {
      const results = [makeHardViolation("logo.1")];
      const decision = makeDecision(makeScore(95, 1), results, phase);
      expect(decision.outcome).toBe(Decision.ApprovedWithWarnings);
    });

    it("converts escalations to warnings", () => {
      const decision = makeDecision(makeScore(75), [], phase);
      expect(decision.outcome).toBe(Decision.ApprovedWithWarnings);
    });

    it("keeps approvals as-is", () => {
      const decision = makeDecision(makeScore(95), [], phase);
      expect(decision.outcome).toBe(Decision.Approved);
    });
  });

  describe("Auto-fix", () => {
    it("reports auto-fixed when fixes resolved all issues", () => {
      const decision = makeDecision(makeScore(100), [], GovernancePhase.Enforce, 3);
      expect(decision.outcome).toBe(Decision.AutoFixed);
      expect(decision.fixesSummary).toContain("3");
    });
  });
});
