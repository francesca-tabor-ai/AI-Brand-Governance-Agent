import type { ExportEvent } from "@brand-governance/shared";
import { ExportEventSchema } from "@brand-governance/shared";

export interface ParsedExportEvent {
  valid: true;
  event: ExportEvent;
}

export interface InvalidExportEvent {
  valid: false;
  errors: string[];
}

/**
 * Parse and validate an incoming Adobe plugin export event payload.
 */
export function parseExportEvent(
  payload: unknown,
): ParsedExportEvent | InvalidExportEvent {
  const result = ExportEventSchema.safeParse(payload);

  if (result.success) {
    return { valid: true, event: result.data as ExportEvent };
  }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
  return { valid: false, errors };
}
