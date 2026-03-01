import type { CheckCategory } from "./enums.js";

/**
 * Computed compliance score for an export event.
 * 0-100 scale with category-level breakdowns.
 *
 * Thresholds (configurable via constants/thresholds.ts):
 *   90-100: Approved (green)
 *   70-89:  Warning (amber) — may auto-fix or escalate
 *   0-69:   Reject/Escalate (red)
 */
export interface ComplianceScore {
  /** Overall score 0-100 */
  overall: number;
  /** Score per check category */
  categories: CategoryScore[];

  totalChecks: number;
  passed: number;
  failed: number;

  hardViolations: number;
  softViolations: number;
  infoFindings: number;
}

export interface CategoryScore {
  category: CheckCategory;
  /** Score 0-100 for this category */
  score: number;
  /** Weight used in overall score (0-1) */
  weight: number;
  /** Weighted contribution to overall score */
  weightedScore: number;
  checkCount: number;
  passedCount: number;
}
