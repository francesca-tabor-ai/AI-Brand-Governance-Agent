import { CheckCategory } from "@brand-governance/shared";

/**
 * Default category weights for compliance scoring.
 * Each weight is 0-1; they are normalized during scoring so
 * exact values only matter relative to each other.
 */
export const DEFAULT_CATEGORY_WEIGHTS: Record<CheckCategory, number> = {
  [CheckCategory.Dimensions]: 0.8,
  [CheckCategory.ColorPalette]: 0.7,
  [CheckCategory.LogoCompliance]: 1.0,
  [CheckCategory.Disclaimer]: 1.0,
  [CheckCategory.Typography]: 0.6,
  [CheckCategory.FileSpecs]: 0.5,
  [CheckCategory.CopyTone]: 0.6,
  [CheckCategory.ClaimsReview]: 0.9,
  [CheckCategory.VisualDrift]: 0.5,
};
