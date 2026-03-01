/** Canonical rule IDs used across policies and checks */
export const RULE_IDS = {
  // Dimensions
  DIM_MIN_DPI: "dim.min_dpi",
  DIM_DIMENSIONS: "dim.dimensions",
  DIM_BLEED: "dim.bleed",

  // File specs
  FILE_MAX_SIZE: "file.max_size",
  FILE_COLOR_MODE: "file.color_mode",
  FILE_FORMAT: "file.format",

  // Color palette
  COLOR_PALETTE: "color.palette_compliance",
  COLOR_CONTRAST: "color.contrast_ratio",

  // Logo compliance
  LOGO_VERSION: "logo.version_current",
  LOGO_MARKET: "logo.market_allowed",
  LOGO_STATUS: "logo.status_active",

  // Disclaimers
  DISCLAIMER_PRESENT: "disclaimer.required_present",
  DISCLAIMER_VERSION: "disclaimer.version_current",
  DISCLAIMER_MARKET: "disclaimer.market_match",

  // Typography
  TYPO_APPROVED_FONTS: "typo.approved_fonts",
  TYPO_MIN_SIZE: "typo.min_size",

  // AI: Copy tone
  COPY_TONE: "copy.tone_compliance",

  // AI: Claims
  CLAIMS_ALLOWED: "claims.allowed_only",
  CLAIMS_DISCLAIMER: "claims.disclaimer_required",

  // AI: Visual drift
  VISUAL_DRIFT: "visual.drift_detection",
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];
