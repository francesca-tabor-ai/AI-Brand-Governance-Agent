/**
 * Shared test fixtures for use across all packages.
 * Import via "@brand-governance/shared/dist/test-fixtures.js"
 */
import type { ExportEvent } from "./types/export-event.js";

export const sampleExportEvent: ExportEvent = {
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: "2026-03-01T10:00:00.000Z",
  user: {
    userId: "user-001",
    email: "designer@company.com",
    name: "Jane Designer",
  },
  document: {
    name: "Campaign-Hero-Banner.indd",
    application: "InDesign",
    applicationVersion: "19.0",
    filePath: "/Users/designer/Documents/Campaign-Hero-Banner.indd",
  },
  context: {
    brandId: "brand-001",
    brandName: "Acme Corp",
    market: "US",
    channel: "web",
    language: "en",
    campaignId: "campaign-2026-spring",
  },
  output: {
    format: "png",
    widthPx: 1200,
    heightPx: 628,
    dpi: 72,
    colorMode: "RGB",
    fileSizeBytes: 450_000,
    bleedPt: 0,
    outputPath: "/exports/Campaign-Hero-Banner.png",
  },
  textContent: [
    {
      elementRef: "headline",
      content: "Spring Collection Now Available",
      fontFamily: "Helvetica Neue",
      fontSizePt: 36,
      fontWeight: "700",
      colorHex: "#003366",
    },
    {
      elementRef: "disclaimer-footer",
      content: "Terms and conditions apply. See website for details.",
      fontFamily: "Helvetica Neue",
      fontSizePt: 8,
      fontWeight: "400",
      colorHex: "#666666",
    },
  ],
  placedAssets: [
    {
      elementRef: "logo-main",
      assetId: "logo-001",
      assetType: "logo",
      sourcePath: "/assets/acme-logo-primary.svg",
      bounds: { x: 50, y: 20, width: 200, height: 80 },
    },
  ],
  extractedColors: ["#003366", "#666666", "#FFFFFF", "#FF6600"],
};

export const samplePrintEvent: ExportEvent = {
  ...sampleExportEvent,
  eventId: "550e8400-e29b-41d4-a716-446655440001",
  context: {
    ...sampleExportEvent.context,
    channel: "print",
  },
  output: {
    format: "pdf",
    widthPx: 2480,
    heightPx: 3508,
    dpi: 300,
    colorMode: "CMYK",
    fileSizeBytes: 15_000_000,
    bleedPt: 9,
    outputPath: "/exports/Campaign-Print-A4.pdf",
  },
};

export const sampleBrandPayload = {
  meta: {
    brandId: "brand-001",
    brandName: "Acme Corp",
    payloadVersion: "abc123",
    generatedAt: "2026-03-01T00:00:00.000Z",
    dataVersion: {
      syncedAt: "2026-03-01T00:00:00.000Z",
      tokensCount: 8,
      assetsCount: 3,
      disclaimersCount: 2,
    },
  },
  swatches: [
    { tokenId: "color-001", name: "Primary Blue", hexValue: "#003366", role: "primary", rgb: { r: 0, g: 51, b: 102 } },
    { tokenId: "color-002", name: "Accent Orange", hexValue: "#FF6600", role: "accent", rgb: { r: 255, g: 102, b: 0 } },
    { tokenId: "color-003", name: "Neutral Gray", hexValue: "#666666", role: "neutral", rgb: { r: 102, g: 102, b: 102 } },
    { tokenId: "color-004", name: "Light Gray", hexValue: "#F5F5F5", role: "background", rgb: { r: 245, g: 245, b: 245 } },
  ],
  typography: [
    { tokenId: "typo-001", name: "Heading", fontFamily: "Helvetica Neue", fontWeight: "700", fontSize: "36px", lineHeight: "1.2" },
    { tokenId: "typo-002", name: "Body", fontFamily: "Helvetica Neue", fontWeight: "400", fontSize: "16px", lineHeight: "1.5" },
    { tokenId: "typo-003", name: "Disclaimer", fontFamily: "Arial", fontWeight: "400", fontSize: "8px", lineHeight: "1.3" },
  ],
  logos: [
    { assetId: "logo-001", assetType: "logo-primary", damUrl: "https://dam.example.com/logo-001", localPath: null, usageRights: "internal", allowedMarkets: ["US", "DE", "FR"], tags: ["primary"], status: "active" },
    { assetId: "logo-002", assetType: "logo-secondary", damUrl: "https://dam.example.com/logo-002", localPath: null, usageRights: "internal", allowedMarkets: ["US"], tags: ["secondary"], status: "active" },
    { assetId: "logo-deprecated", assetType: "logo-primary", damUrl: "https://dam.example.com/logo-old", localPath: null, usageRights: "internal", allowedMarkets: [], tags: ["old"], status: "deprecated" },
  ],
  disclaimers: [
    { disclaimerId: "disc-001", disclaimerText: "Terms and conditions apply. See website for details.", disclaimerType: "general", marketLocales: ["US", "DE", "FR"], version: "1", status: "active", validFrom: "2025-01-01", validTo: null },
    { disclaimerId: "disc-002", disclaimerText: "These statements have not been evaluated by the FDA.", disclaimerType: "fda_general", marketLocales: ["US"], version: "1", status: "active", validFrom: "2025-01-01", validTo: null },
  ],
  claims: [
    { claimId: "claim-001", claimText: "Clinically proven", claimCategory: "health", requiresDisclaimer: "disc-002", allowedMarkets: ["US"], status: "active" },
  ],
  markets: [
    { localeId: "en-US", market: "US", language: "en", legalRegime: "FDA" },
    { localeId: "de-DE", market: "DE", language: "de", legalRegime: "EU" },
  ],
};
