/** Score at or above which an export is auto-approved */
export const SCORE_APPROVED = 90;

/** Score below which an export is escalated or rejected */
export const SCORE_ESCALATE = 70;

/** Score thresholds for Slack severity routing */
export const SLACK_SEVERITY_THRESHOLDS = {
  critical: 50,
  warning: 70,
} as const;

/** Default maximum file sizes by channel (bytes) */
export const DEFAULT_MAX_FILE_SIZE: Record<string, number> = {
  web: 5_242_880, // 5 MB
  paid_social: 10_485_760, // 10 MB
  email: 2_097_152, // 2 MB
  print: 524_288_000, // 500 MB
  ooh: 524_288_000, // 500 MB
  default: 52_428_800, // 50 MB
};

/** Default minimum DPI by channel */
export const DEFAULT_MIN_DPI: Record<string, number> = {
  print: 300,
  ooh: 150,
  web: 72,
  paid_social: 72,
  email: 72,
  default: 72,
};

/** Maximum delta-E (CIE76) before a color is considered off-palette */
export const DEFAULT_MAX_DELTA_E = 3.0;
