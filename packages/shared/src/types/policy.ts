import type { Severity, RuleAction, CheckCategory } from "./enums.js";

/**
 * A single governance rule. Rules are grouped into PolicySets and
 * can be defined in YAML files or synced from Airtable.
 */
export interface PolicyRule {
  /** Unique rule identifier, e.g. "color.delta_e_max" */
  ruleId: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Which QA/AI check category this rule belongs to */
  category: CheckCategory;
  /** Severity determines blocking behavior */
  severity: Severity;
  /** Action to take when violated */
  action: RuleAction;
  /** Whether this rule is currently active */
  enabled: boolean;

  /** Rule parameters — interpreted by the specific check function */
  params: Record<string, unknown>;

  /** When this rule applies (all conditions AND) */
  scope: RuleScope;

  /** Scoring weight (0-1) for compliance score calculation */
  weight: number;
}

/**
 * Scope determines when a rule applies. All conditions must match
 * (AND logic). Empty arrays mean "all values" (no restriction).
 */
export interface RuleScope {
  /** Which brands this rule applies to (empty = all) */
  brands: string[];
  /** Which markets (empty = all) */
  markets: string[];
  /** Which channels (empty = all) */
  channels: string[];
  /** Which asset formats (empty = all) */
  formats: string[];
  /** Which applications (empty = all) */
  applications: string[];
}

/**
 * A named collection of rules, typically loaded from a YAML file
 * or an Airtable view.
 */
export interface PolicySet {
  setId: string;
  name: string;
  description: string;
  /** Version string (semver or date-based) */
  version: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
  rules: PolicyRule[];
}
