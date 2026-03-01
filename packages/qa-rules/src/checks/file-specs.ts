import type {
  ExportEvent,
  PolicyRule,
  CheckResult,
} from "@brand-governance/shared";
import { CheckCategory } from "@brand-governance/shared";

/**
 * Check file format, size, and color mode constraints.
 */
export function checkFileSpecs(
  event: ExportEvent,
  rule: PolicyRule,
): CheckResult[] {
  const results: CheckResult[] = [];
  const params = rule.params as Record<string, unknown>;
  const { output, context } = event;

  // Max file size
  if (params.maxSizeByChannel) {
    const sizeMap = params.maxSizeByChannel as Record<string, number>;
    const maxSize = sizeMap[context.channel] ?? sizeMap["default"] ?? Infinity;
    const passed = output.fileSizeBytes <= maxSize;

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.FileSpecs,
      passed,
      severity: rule.severity,
      message: passed
        ? `File size ${formatBytes(output.fileSizeBytes)} within ${formatBytes(maxSize)} limit`
        : `File size ${formatBytes(output.fileSizeBytes)} exceeds ${formatBytes(maxSize)} limit for ${context.channel}`,
      elementRef: "document",
      detail: !passed
        ? {
            expected: maxSize,
            actual: output.fileSizeBytes,
            deviation: output.fileSizeBytes - maxSize,
            deviationUnit: "bytes",
          }
        : undefined,
    });
  }

  // Color mode
  if (params.requiredModeByChannel) {
    const modeMap = params.requiredModeByChannel as Record<string, string>;
    const required = modeMap[context.channel];

    if (required) {
      const passed = output.colorMode.toUpperCase() === required.toUpperCase();

      results.push({
        ruleId: rule.ruleId,
        category: CheckCategory.FileSpecs,
        passed,
        severity: rule.severity,
        message: passed
          ? `Color mode ${output.colorMode} is correct for ${context.channel}`
          : `Color mode ${output.colorMode} should be ${required} for ${context.channel}`,
        elementRef: "document",
        detail: !passed
          ? { expected: required, actual: output.colorMode }
          : undefined,
      });
    }
  }

  // Allowed formats
  if (params.allowedFormats) {
    const allowed = params.allowedFormats as string[];
    const passed = allowed.includes(output.format.toLowerCase());

    results.push({
      ruleId: rule.ruleId,
      category: CheckCategory.FileSpecs,
      passed,
      severity: rule.severity,
      message: passed
        ? `Format "${output.format}" is allowed for ${context.channel}`
        : `Format "${output.format}" is not allowed for ${context.channel} (allowed: ${allowed.join(", ")})`,
      elementRef: "document",
      detail: !passed
        ? { expected: allowed.join(", "), actual: output.format }
        : undefined,
    });
  }

  return results;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
