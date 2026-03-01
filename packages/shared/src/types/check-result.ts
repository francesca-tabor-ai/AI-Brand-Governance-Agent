import type { CheckCategory, Severity, FixType } from "./enums.js";

/**
 * Result of a single QA or AI check against one aspect of an export.
 * Aligns with project 3's ValidationItem pattern for cross-project
 * consistency.
 */
export interface CheckResult {
  /** The rule that was evaluated */
  ruleId: string;
  /** Category of the check */
  category: CheckCategory;
  /** Did it pass? */
  passed: boolean;
  /** Severity of this rule (from policy) */
  severity: Severity;
  /** Human-readable description of what was checked */
  message: string;
  /** Which element in the document this applies to */
  elementRef: string;
  /** Structured detail about the violation */
  detail?: CheckDetail;
  /** Suggested fix if auto-fixable */
  suggestedFix?: SuggestedFix;
}

/** Structured violation detail for programmatic consumption */
export interface CheckDetail {
  /** What was expected */
  expected: string | number;
  /** What was actually found */
  actual: string | number;
  /** How far off (percentage, delta-E, pixel count, etc.) */
  deviation?: number;
  /** Deviation unit label */
  deviationUnit?: string;
  /** Additional context */
  meta?: Record<string, unknown>;
}

/** A fix that the auto-fix service could apply */
export interface SuggestedFix {
  fixType: FixType;
  description: string;
  /** Whether this fix can be safely applied without human review */
  safeToAutoApply: boolean;
  /** Parameters the fix service needs */
  params: Record<string, unknown>;
}
