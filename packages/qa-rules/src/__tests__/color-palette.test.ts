import { checkColorPalette } from "../checks/color-palette.js";
import { Severity, RuleAction, CheckCategory } from "@brand-governance/shared";
import type { PolicyRule, ExportEvent } from "@brand-governance/shared";
import { sampleExportEvent, sampleBrandPayload } from "@brand-governance/shared/dist/test-fixtures.js";

const colorRule: PolicyRule = {
  ruleId: "color.palette_compliance",
  name: "Color Compliance",
  description: "",
  category: CheckCategory.ColorPalette,
  severity: Severity.Soft,
  action: RuleAction.AutoFix,
  enabled: true,
  weight: 0.7,
  scope: { brands: [], markets: [], channels: [], formats: [], applications: [] },
  params: {
    maxDeltaE: 3.0,
    ignoreBlackWhite: true,
  },
};

describe("checkColorPalette", () => {
  it("passes when all colors match the palette", () => {
    const results = checkColorPalette(sampleExportEvent, colorRule, sampleBrandPayload);
    const failed = results.filter((r) => !r.passed);
    expect(failed.length).toBe(0);
  });

  it("ignores pure black and white when configured", () => {
    const event: ExportEvent = {
      ...sampleExportEvent,
      extractedColors: ["#000000", "#FFFFFF", "#003366"],
      textContent: [],
    };
    const results = checkColorPalette(event, colorRule, sampleBrandPayload);
    // Black and white should be skipped, only #003366 checked
    expect(results.length).toBe(1);
    expect(results[0].passed).toBe(true);
  });

  it("fails for off-palette colors", () => {
    const event: ExportEvent = {
      ...sampleExportEvent,
      extractedColors: ["#FF0000"],
      textContent: [],
    };
    const results = checkColorPalette(event, colorRule, sampleBrandPayload);
    const failed = results.filter((r) => !r.passed);
    expect(failed.length).toBeGreaterThan(0);
    expect(failed[0].suggestedFix).toBeDefined();
  });

  it("returns pass when no colors to check", () => {
    const event: ExportEvent = {
      ...sampleExportEvent,
      extractedColors: [],
      textContent: [],
    };
    const results = checkColorPalette(event, colorRule, sampleBrandPayload);
    expect(results[0].passed).toBe(true);
  });

  it("suggests auto-fix with nearest swatch", () => {
    const event: ExportEvent = {
      ...sampleExportEvent,
      extractedColors: ["#FF0000"],
      textContent: [],
    };
    const results = checkColorPalette(event, colorRule, sampleBrandPayload);
    const failed = results.find((r) => !r.passed);
    expect(failed?.suggestedFix?.fixType).toBe("color_remap");
    expect(failed?.suggestedFix?.params.from).toBe("#FF0000");
  });
});
