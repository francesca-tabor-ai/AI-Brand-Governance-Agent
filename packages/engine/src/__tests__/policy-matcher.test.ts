import { matchRules } from "../policy/policy-matcher.js";
import type { PolicySet, ExportContext } from "@brand-governance/shared";
import { Severity, RuleAction, CheckCategory } from "@brand-governance/shared";

function makeRule(
  ruleId: string,
  scope: Partial<{
    brands: string[];
    markets: string[];
    channels: string[];
    formats: string[];
    applications: string[];
  }> = {},
) {
  return {
    ruleId,
    name: ruleId,
    description: "",
    category: CheckCategory.Dimensions,
    severity: Severity.Soft,
    action: RuleAction.Log,
    enabled: true,
    weight: 0.5,
    params: {},
    scope: {
      brands: scope.brands ?? [],
      markets: scope.markets ?? [],
      channels: scope.channels ?? [],
      formats: scope.formats ?? [],
      applications: scope.applications ?? [],
    },
  };
}

const policySet: PolicySet = {
  setId: "test",
  name: "Test",
  description: "",
  version: "1.0.0",
  updatedAt: "",
  rules: [
    makeRule("universal"),
    makeRule("us-only", { markets: ["US"] }),
    makeRule("print-only", { channels: ["print"] }),
    makeRule("pdf-only", { formats: ["pdf"] }),
    makeRule("indesign-only", { applications: ["InDesign"] }),
    makeRule("us-print", { markets: ["US"], channels: ["print"] }),
  ],
};

const context: ExportContext = {
  brandId: "brand-001",
  brandName: "Test",
  market: "US",
  channel: "web",
  language: "en",
};

describe("matchRules", () => {
  it("matches universal rules (empty scope = all)", () => {
    const rules = matchRules([policySet], context, "png", "InDesign");
    expect(rules.some((r) => r.ruleId === "universal")).toBe(true);
  });

  it("matches market-specific rules", () => {
    const rules = matchRules([policySet], context, "png", "InDesign");
    expect(rules.some((r) => r.ruleId === "us-only")).toBe(true);
  });

  it("excludes rules for non-matching markets", () => {
    const deContext = { ...context, market: "DE" };
    const rules = matchRules([policySet], deContext, "png", "InDesign");
    expect(rules.some((r) => r.ruleId === "us-only")).toBe(false);
  });

  it("excludes rules for non-matching channels", () => {
    const rules = matchRules([policySet], context, "png", "InDesign");
    expect(rules.some((r) => r.ruleId === "print-only")).toBe(false);
  });

  it("matches when all scope conditions match (AND logic)", () => {
    const printContext = { ...context, channel: "print" };
    const rules = matchRules([policySet], printContext, "pdf", "InDesign");
    expect(rules.some((r) => r.ruleId === "us-print")).toBe(true);
  });

  it("excludes when any scope condition fails (AND logic)", () => {
    const deContext = { ...context, market: "DE", channel: "print" };
    const rules = matchRules([policySet], deContext, "pdf", "InDesign");
    expect(rules.some((r) => r.ruleId === "us-print")).toBe(false);
  });

  it("skips disabled rules", () => {
    const disabledSet: PolicySet = {
      ...policySet,
      rules: [{ ...makeRule("disabled"), enabled: false }],
    };
    const rules = matchRules([disabledSet], context, "png", "InDesign");
    expect(rules).toHaveLength(0);
  });

  it("deduplicates rules from multiple policy sets (last wins)", () => {
    const overlay: PolicySet = {
      ...policySet,
      setId: "overlay",
      rules: [{ ...makeRule("universal"), weight: 0.9 }],
    };
    const rules = matchRules([policySet, overlay], context, "png", "InDesign");
    const universalRules = rules.filter((r) => r.ruleId === "universal");
    expect(universalRules).toHaveLength(1);
    expect(universalRules[0].weight).toBe(0.9);
  });
});
