import { z } from "zod";

/** Zod schema for validating incoming ExportEvent payloads */
export const ExportEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),

  user: z.object({
    userId: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
  }),

  document: z.object({
    name: z.string().min(1),
    application: z.enum([
      "InDesign",
      "Photoshop",
      "Illustrator",
      "PremierePro",
      "AfterEffects",
    ]),
    applicationVersion: z.string(),
    filePath: z.string(),
  }),

  context: z.object({
    brandId: z.string().min(1),
    brandName: z.string().min(1),
    market: z.string().min(1),
    channel: z.string().min(1),
    language: z.string().min(1),
    campaignId: z.string().optional(),
    templateId: z.string().optional(),
  }),

  output: z.object({
    format: z.string().min(1),
    widthPx: z.number().positive(),
    heightPx: z.number().positive(),
    dpi: z.number().positive(),
    colorMode: z.string().min(1),
    fileSizeBytes: z.number().nonnegative(),
    bleedPt: z.number().nonnegative(),
    outputPath: z.string(),
  }),

  textContent: z
    .array(
      z.object({
        elementRef: z.string(),
        content: z.string(),
        fontFamily: z.string(),
        fontSizePt: z.number(),
        fontWeight: z.string(),
        colorHex: z.string(),
      }),
    )
    .optional(),

  placedAssets: z
    .array(
      z.object({
        elementRef: z.string(),
        assetId: z.string().optional(),
        assetType: z.string(),
        sourcePath: z.string(),
        bounds: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
      }),
    )
    .optional(),

  extractedColors: z.array(z.string()).optional(),
});

export type ValidatedExportEvent = z.infer<typeof ExportEventSchema>;
