import { checkDimensions } from "../checks/dimensions.js";
import { sampleExportEvent, samplePrintEvent } from "@brand-governance/shared/dist/test-fixtures.js";
import { Severity, RuleAction, CheckCategory } from "@brand-governance/shared";
import type { PolicyRule } from "@brand-governance/shared";

const dpiRule: PolicyRule = {
  ruleId: "dim.min_dpi",
  name: "Min DPI",
  description: "",
  category: CheckCategory.Dimensions,
  severity: Severity.Hard,
  action: RuleAction.Reject,
  enabled: true,
  weight: 0.8,
  scope: { brands: [], markets: [], channels: [], formats: [], applications: [] },
  params: {
    minDpiByChannel: {
      print: 300,
      web: 72,
      default: 72,
    },
  },
};

describe("checkDimensions", () => {
  it("passes when web DPI meets minimum", () => {
    const results = checkDimensions(sampleExportEvent, dpiRule);
    expect(results[0].passed).toBe(true);
  });

  it("passes when print DPI meets 300", () => {
    const results = checkDimensions(samplePrintEvent, dpiRule);
    expect(results[0].passed).toBe(true);
  });

  it("fails when print DPI is below 300", () => {
    const lowDpiEvent = {
      ...samplePrintEvent,
      output: { ...samplePrintEvent.output, dpi: 150 },
    };
    const results = checkDimensions(lowDpiEvent, dpiRule);
    expect(results[0].passed).toBe(false);
    expect(results[0].detail?.expected).toBe(300);
    expect(results[0].detail?.actual).toBe(150);
  });

  it("checks max dimensions when params are set", () => {
    const maxDimRule: PolicyRule = {
      ...dpiRule,
      params: { maxWidthPx: 4096, maxHeightPx: 4096 },
    };
    const results = checkDimensions(sampleExportEvent, maxDimRule);
    expect(results[0].passed).toBe(true);
  });

  it("fails when dimensions exceed max", () => {
    const maxDimRule: PolicyRule = {
      ...dpiRule,
      params: { maxWidthPx: 1000, maxHeightPx: 500 },
    };
    const results = checkDimensions(sampleExportEvent, maxDimRule);
    expect(results[0].passed).toBe(false);
  });

  it("checks bleed when params are set", () => {
    const bleedRule: PolicyRule = {
      ...dpiRule,
      params: { minBleedPt: 9 },
    };
    const results = checkDimensions(samplePrintEvent, bleedRule);
    expect(results[0].passed).toBe(true);
  });
});
