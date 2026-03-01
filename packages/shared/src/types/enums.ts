/** Severity level of a policy rule or check violation */
export enum Severity {
  /** Informational only — logged but never blocks */
  Info = "info",
  /** Soft violation — triggers warning, may auto-fix */
  Soft = "soft",
  /** Hard violation — blocks export, requires human action */
  Hard = "hard",
}

/** Action the engine should take when a rule is violated */
export enum RuleAction {
  /** Log the violation, take no further action */
  Log = "log",
  /** Attempt automatic correction */
  AutoFix = "auto_fix",
  /** Reject the export outright */
  Reject = "reject",
  /** Escalate to human reviewer */
  Escalate = "escalate",
}

/** Governance decision outcome */
export enum Decision {
  Approved = "approved",
  ApprovedWithWarnings = "approved_with_warnings",
  Rejected = "rejected",
  Escalated = "escalated",
  AutoFixed = "auto_fixed",
  PendingReview = "pending_review",
}

/** Rollout phase controlling enforcement behavior */
export enum GovernancePhase {
  /** Phase 1: Monitor only, never block */
  Observe = "observe",
  /** Phase 2: Warn users and suggest fixes */
  Warn = "warn",
  /** Phase 3: Enforce hard rules, block violations */
  Enforce = "enforce",
  /** Phase 4: Full autonomy with expanded auto-fix */
  Autonomous = "autonomous",
}

/** Category of QA check */
export enum CheckCategory {
  Dimensions = "dimensions",
  ColorPalette = "color_palette",
  LogoCompliance = "logo_compliance",
  Disclaimer = "disclaimer",
  Typography = "typography",
  FileSpecs = "file_specs",
  CopyTone = "copy_tone",
  ClaimsReview = "claims_review",
  VisualDrift = "visual_drift",
}

/** Type of automatic fix */
export enum FixType {
  ColorRemap = "color_remap",
  LogoReplace = "logo_replace",
  DisclaimerInsert = "disclaimer_insert",
  FontNormalize = "font_normalize",
}
