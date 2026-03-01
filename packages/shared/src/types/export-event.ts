/**
 * Event emitted by the Adobe plugin or render pipeline when a creative
 * asset is exported. Primary input to the governance evaluation pipeline.
 *
 * Extends the concept of project 3's AuditEvent ("export.completed")
 * with governance-specific metadata.
 */
export interface ExportEvent {
  /** Unique event ID (UUID v4) */
  eventId: string;
  /** ISO 8601 timestamp */
  timestamp: string;

  /** Who triggered the export */
  user: ExportUser;
  /** The creative document being exported */
  document: ExportDocument;
  /** Brand context — which brand, market, channel */
  context: ExportContext;
  /** Raw file information about the export output */
  output: ExportOutput;

  /** Extracted text content for AI/disclaimer analysis */
  textContent?: ExtractedText[];
  /** References to placed assets (logos, images) */
  placedAssets?: PlacedAsset[];
  /** Dominant colors extracted from the document */
  extractedColors?: string[];
}

export interface ExportUser {
  userId: string;
  email: string;
  name: string;
}

export interface ExportDocument {
  name: string;
  application:
    | "InDesign"
    | "Photoshop"
    | "Illustrator"
    | "PremierePro"
    | "AfterEffects";
  applicationVersion: string;
  filePath: string;
}

export interface ExportContext {
  brandId: string;
  brandName: string;
  /** Target market code, e.g. "US", "DE" */
  market: string;
  /** Target channel, e.g. "print", "web", "paid_social" */
  channel: string;
  /** Language code, e.g. "en", "de" */
  language: string;
  campaignId?: string;
  templateId?: string;
}

export interface ExportOutput {
  /** Export format: "pdf", "png", "jpg", "tiff", "svg", "eps" */
  format: string;
  /** Width in pixels (raster) or points (vector/print) */
  widthPx: number;
  /** Height in pixels or points */
  heightPx: number;
  /** DPI / PPI resolution */
  dpi: number;
  /** Color mode: "RGB", "CMYK", "Grayscale" */
  colorMode: string;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Bleed in points (0 if none) */
  bleedPt: number;
  /** Path to the exported file */
  outputPath: string;
}

export interface ExtractedText {
  /** Layer or frame identifier */
  elementRef: string;
  /** The text content */
  content: string;
  fontFamily: string;
  /** Font size in points */
  fontSizePt: number;
  /** Font weight (e.g., "400", "700", "bold") */
  fontWeight: string;
  /** Text color as hex */
  colorHex: string;
}

export interface PlacedAsset {
  /** Layer or frame identifier */
  elementRef: string;
  /** Asset ID from DAM/brand payload, if known */
  assetId?: string;
  /** Asset type: "logo", "image", "icon" */
  assetType: string;
  /** File path or URL of the placed asset */
  sourcePath: string;
  bounds: { x: number; y: number; width: number; height: number };
}
