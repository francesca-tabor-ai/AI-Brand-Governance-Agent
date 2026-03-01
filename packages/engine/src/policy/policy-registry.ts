import type { PolicySet } from "@brand-governance/shared";
import { loadPoliciesFromDir } from "./policy-loader.js";

/**
 * In-memory registry of loaded policy sets.
 * Loaded on startup and refreshed on demand.
 */
export class PolicyRegistry {
  private sets: PolicySet[] = [];
  private policiesDir: string;

  constructor(policiesDir: string) {
    this.policiesDir = policiesDir;
  }

  /** Load all policies from the policies directory */
  load(): void {
    this.sets = loadPoliciesFromDir(this.policiesDir);
  }

  /** Get all loaded policy sets */
  getAll(): PolicySet[] {
    return this.sets;
  }

  /** Get a specific policy set by ID */
  getById(setId: string): PolicySet | undefined {
    return this.sets.find((s) => s.setId === setId);
  }

  /** Replace all sets (e.g. after an Airtable sync) */
  replaceAll(sets: PolicySet[]): void {
    this.sets = sets;
  }

  /** Add or replace a single policy set */
  upsert(set: PolicySet): void {
    const idx = this.sets.findIndex((s) => s.setId === set.setId);
    if (idx >= 0) {
      this.sets[idx] = set;
    } else {
      this.sets.push(set);
    }
  }

  /** Total number of enabled rules across all sets */
  get ruleCount(): number {
    return this.sets.reduce(
      (sum, set) => sum + set.rules.filter((r) => r.enabled).length,
      0,
    );
  }
}
