import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory, FixType } from "@brand-governance/shared";

interface BrandDisclaimers {
  disclaimers: Array<{
    disclaimerId: string;
    disclaimerText: string;
    disclaimerType: string;
    marketLocales: string[];
    version: string;
    status: string;
  }>;
}

/**
 * Check that required disclaimers are present in the document text
 * for the target market.
 */
export function checkDisclaimer(
  event: ExportEvent,
  rule: PolicyRule,
  brandPayload: BrandDisclaimers,
): CheckResult[] {
  const results: CheckResult[] = [];
  const params = rule.params as Record<string, unknown>;
  const checkPresence = (params.checkPresence as boolean) ?? true;
  const checkVersion = (params.checkVersion as boolean) ?? false;
  const checkMarketMatch = (params.checkMarketMatch as boolean) ?? false;

  const market = event.context.market;
  const documentText = (event.textContent ?? [])
    .map((t) => t.content)
    .join("\n")
    .toLowerCase();

  // Find disclaimers required for this market
  const requiredDisclaimers = brandPayload.disclaimers.filter(
    (d) =>
      d.status === "active" &&
      (d.marketLocales.length === 0 || d.marketLocales.includes(market)),
  );

  // Filter by specific types if the rule specifies them
  const requiredTypes = params.requiredDisclaimerTypes as string[] | undefined;
  const disclaimersToCheck = requiredTypes
    ? requiredDisclaimers.filter((d) => requiredTypes.includes(d.disclaimerType))
    : requiredDisclaimers;

  if (disclaimersToCheck.length === 0) {
    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Disclaimer,
      passed: true,
      severity: rule.severity,
      message: `No disclaimers required for market ${market}`,
      elementRef: "document",
    });
    return results;
  }

  if (!event.textContent || event.textContent.length === 0) {
    // No text content available — can't verify disclaimers
    for (const disclaimer of disclaimersToCheck) {
      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.Disclaimer,
        passed: false,
        severity: rule.severity,
        message: `Cannot verify disclaimer "${disclaimer.disclaimerType}" — no text content provided`,
        elementRef: "document",
        suggestedFix: {
          fixType: FixType.DisclaimerInsert,
          description: `Insert ${disclaimer.disclaimerType} disclaimer for market ${market}`,
          safeToAutoApply: false,
          params: {
            disclaimerId: disclaimer.disclaimerId,
            text: disclaimer.disclaimerText,
          },
        },
      });
    }
    return results;
  }

  // Check each required disclaimer
  for (const disclaimer of disclaimersToCheck) {
    if (!checkPresence) continue;

    // Fuzzy presence check: see if the key portion of the disclaimer text
    // appears in the document
    const disclaimerLower = disclaimer.disclaimerText.toLowerCase();
    const keyPhrase = extractKeyPhrase(disclaimerLower);
    const found = documentText.includes(keyPhrase);

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.Disclaimer,
      passed: found,
      severity: rule.severity,
      message: found
        ? `Disclaimer "${disclaimer.disclaimerType}" found in document`
        : `Disclaimer "${disclaimer.disclaimerType}" missing for market ${market}`,
      elementRef: "document",
      detail: !found
        ? {
            expected: disclaimer.disclaimerText.substring(0, 80),
            actual: "(not found in document text)",
          }
        : undefined,
      suggestedFix: !found
        ? {
            fixType: FixType.DisclaimerInsert,
            description: `Insert ${disclaimer.disclaimerType} disclaimer`,
            safeToAutoApply: true,
            params: {
              disclaimerId: disclaimer.disclaimerId,
              text: disclaimer.disclaimerText,
            },
          }
        : undefined,
    });
  }

  return results;
}

/**
 * Extract a representative key phrase from disclaimer text
 * (first 50 chars or first sentence, whichever is shorter).
 */
function extractKeyPhrase(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0] ?? text;
  return firstSentence.substring(0, 50).trim();
}
