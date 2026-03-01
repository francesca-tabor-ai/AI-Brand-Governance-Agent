import * as fs from "node:fs";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";
import type { PolicySet, PolicyRule } from "@brand-governance/shared";
import { Severity, RuleAction, CheckCategory } from "@brand-governance/shared";

/**
 * Load a PolicySet from a YAML file on disk.
 */
export function loadPolicyFile(filePath: string): PolicySet {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc = parseYaml(raw) as RawPolicyDoc;

  return {
    setId: doc.setId,
    name: doc.name,
    description: doc.description,
    version: doc.version,
    updatedAt: new Date().toISOString(),
    rules: (doc.rules || []).map(normalizeRule),
  };
}

/**
 * Load all policy files from a directory tree.
 * Walks the policies/ folder and merges default + overlays.
 */
export function loadPoliciesFromDir(policiesDir: string): PolicySet[] {
  const sets: PolicySet[] = [];

  const defaultFile = path.join(policiesDir, "default-policy.yaml");
  if (fs.existsSync(defaultFile)) {
    sets.push(loadPolicyFile(defaultFile));
  }

  // Load subdirectories (markets/, channels/, brands/)
  for (const subdir of ["markets", "channels", "brands"]) {
    const dirPath = path.join(policiesDir, subdir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml"));
    for (const file of files) {
      sets.push(loadPolicyFile(path.join(dirPath, file)));
    }
  }

  return sets;
}

// ── Internal types for raw YAML parsing ──────────────────────

interface RawPolicyDoc {
  setId: string;
  name: string;
  description: string;
  version: string;
  rules: RawRule[];
}

interface RawRule {
  ruleId: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  action: string;
  enabled: boolean;
  weight: number;
  scope: {
    brands: string[];
    markets: string[];
    channels: string[];
    formats: string[];
    applications: string[];
  };
  params: Record<string, unknown>;
}

function normalizeRule(raw: RawRule): PolicyRule {
  return {
    ruleId: raw.ruleId,
    name: raw.name,
    description: raw.description,
    category: toCheckCategory(raw.category),
    severity: toSeverity(raw.severity),
    action: toRuleAction(raw.action),
    enabled: raw.enabled ?? true,
    weight: raw.weight ?? 0.5,
    params: raw.params || {},
    scope: {
      brands: raw.scope?.brands || [],
      markets: raw.scope?.markets || [],
      channels: raw.scope?.channels || [],
      formats: raw.scope?.formats || [],
      applications: raw.scope?.applications || [],
    },
  };
}

function toSeverity(s: string): Severity {
  const map: Record<string, Severity> = {
    hard: Severity.Hard,
    soft: Severity.Soft,
    info: Severity.Info,
  };
  return map[s] ?? Severity.Info;
}

function toRuleAction(a: string): RuleAction {
  const map: Record<string, RuleAction> = {
    log: RuleAction.Log,
    auto_fix: RuleAction.AutoFix,
    reject: RuleAction.Reject,
    escalate: RuleAction.Escalate,
  };
  return map[a] ?? RuleAction.Log;
}

function toCheckCategory(c: string): CheckCategory {
  const map: Record<string, CheckCategory> = {
    dimensions: CheckCategory.Dimensions,
    color_palette: CheckCategory.ColorPalette,
    logo_compliance: CheckCategory.LogoCompliance,
    disclaimer: CheckCategory.Disclaimer,
    typography: CheckCategory.Typography,
    file_specs: CheckCategory.FileSpecs,
    copy_tone: CheckCategory.CopyTone,
    claims_review: CheckCategory.ClaimsReview,
    visual_drift: CheckCategory.VisualDrift,
  };
  return map[c] ?? CheckCategory.Dimensions;
}
