/**
 * Seed Airtable with initial governance tables and sample data.
 *
 * Usage: npx tsx scripts/seed-airtable.ts
 *
 * Requires AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables.
 *
 * NOTE: Airtable does not support creating tables via API — you must
 * create these tables manually in the Airtable UI. This script
 * populates the tables with initial data once they exist.
 *
 * Required tables:
 *   1. "Governance Reviews" — columns:
 *      Record ID (text), Export Event ID (text), Created At (text),
 *      Brand (text), Market (text), Channel (text), Document Name (text),
 *      Exported By (text), Application (text), Format (text),
 *      Compliance Score (number), Decision (text), Decision Reason (long text),
 *      Hard Violations (number), Soft Violations (number),
 *      Auto-Fixes Applied (number), Phase (text),
 *      Status (single select: Pending/Approved/Rejected/Under Review/Fixed),
 *      Reviewer (text), Review Notes (long text),
 *      Violations Summary (long text), Fixes Summary (long text)
 *
 *   2. "Brand Rules" — columns:
 *      Rule ID (text), Name (text), Description (long text),
 *      Category (single select), Severity (single select: hard/soft/info),
 *      Action (single select: log/auto_fix/reject/escalate),
 *      Enabled (checkbox), Brands (multi-select), Markets (multi-select),
 *      Channels (multi-select), Parameters (long text - JSON),
 *      Weight (number 0-1), Last Updated (text)
 *
 *   3. "Audit Log" — columns:
 *      Timestamp (text), Event Type (text), Record ID (text),
 *      User (text), Action (text), Detail (long text),
 *      Before Value (long text), After Value (long text)
 */

import Airtable from "airtable";

async function main() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error("Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables");
    process.exit(1);
  }

  const base = new Airtable({ apiKey }).base(baseId);

  console.log("Seeding Brand Rules table...");

  const rules = [
    {
      "Rule ID": "dim.min_dpi",
      "Name": "Minimum DPI for Channel",
      "Description": "Exports must meet minimum DPI for their target channel",
      "Category": "dimensions",
      "Severity": "hard",
      "Action": "reject",
      "Enabled": true,
      "Weight": 0.8,
      "Parameters": JSON.stringify({ minDpiByChannel: { print: 300, web: 72 } }),
      "Last Updated": new Date().toISOString(),
    },
    {
      "Rule ID": "color.palette_compliance",
      "Name": "Brand Color Compliance",
      "Description": "Colors must be within delta-E threshold of brand palette",
      "Category": "color_palette",
      "Severity": "soft",
      "Action": "auto_fix",
      "Enabled": true,
      "Weight": 0.7,
      "Parameters": JSON.stringify({ maxDeltaE: 3.0, ignoreBlackWhite: true }),
      "Last Updated": new Date().toISOString(),
    },
    {
      "Rule ID": "logo.version_current",
      "Name": "Current Logo Version",
      "Description": "Only current approved logo version may be used",
      "Category": "logo_compliance",
      "Severity": "hard",
      "Action": "reject",
      "Enabled": true,
      "Weight": 1.0,
      "Parameters": JSON.stringify({ checkVersion: true, checkStatus: true }),
      "Last Updated": new Date().toISOString(),
    },
    {
      "Rule ID": "disclaimer.required_present",
      "Name": "Required Disclaimers Present",
      "Description": "Market-required disclaimers must be present",
      "Category": "disclaimer",
      "Severity": "hard",
      "Action": "auto_fix",
      "Enabled": true,
      "Weight": 1.0,
      "Parameters": JSON.stringify({ checkPresence: true }),
      "Last Updated": new Date().toISOString(),
    },
    {
      "Rule ID": "typo.approved_fonts",
      "Name": "Approved Font Families",
      "Description": "Only approved brand typefaces may be used",
      "Category": "typography",
      "Severity": "soft",
      "Action": "auto_fix",
      "Enabled": true,
      "Weight": 0.6,
      "Parameters": JSON.stringify({ strictMatch: false }),
      "Last Updated": new Date().toISOString(),
    },
  ];

  for (const rule of rules) {
    try {
      await base("Brand Rules").create(rule);
      console.log(`  Created rule: ${rule["Rule ID"]}`);
    } catch (err) {
      console.error(`  Failed to create rule ${rule["Rule ID"]}:`, err);
    }
  }

  console.log("\nSeeding complete. Create the following tables manually if they don't exist:");
  console.log("  - Governance Reviews");
  console.log("  - Brand Rules");
  console.log("  - Audit Log");
  console.log("\nSee column definitions in this script's header comment.");
}

main().catch(console.error);
