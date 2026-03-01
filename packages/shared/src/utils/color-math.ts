/**
 * Color math utilities for brand compliance checks.
 * Implements CIE76 delta-E for measuring perceptual color distance.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

/** Normalize a hex string to uppercase #RRGGBB format */
export function normalizeHex(value: string): string {
  let hex = value.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.toUpperCase();
}

/** Parse a #RRGGBB hex string to RGB values (0-255) */
export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace("#", "");
  return {
    r: parseInt(cleaned.substring(0, 2), 16) || 0,
    g: parseInt(cleaned.substring(2, 4), 16) || 0,
    b: parseInt(cleaned.substring(4, 6), 16) || 0,
  };
}

/** Convert RGB (0-255) to CIE L*a*b* via XYZ intermediate */
export function rgbToLab(rgb: RGB): LAB {
  // Normalize to 0-1
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // sRGB gamma expansion
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ (D65 illuminant)
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  // XYZ to Lab
  const epsilon = 0.008856;
  const kappa = 903.3;

  x = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  y = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  z = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
}

/**
 * Compute CIE76 delta-E between two colors.
 * Values < 1 are imperceptible, < 3 are barely noticeable,
 * > 5 are clearly different.
 */
export function deltaE(hex1: string, hex2: string): number {
  const lab1 = rgbToLab(hexToRgb(normalizeHex(hex1)));
  const lab2 = rgbToLab(hexToRgb(normalizeHex(hex2)));

  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2),
  );
}

/** Check if a hex color is pure black or white (within tolerance) */
export function isBlackOrWhite(hex: string, tolerance = 10): boolean {
  const rgb = hexToRgb(normalizeHex(hex));
  const isNearBlack = rgb.r <= tolerance && rgb.g <= tolerance && rgb.b <= tolerance;
  const isNearWhite =
    rgb.r >= 255 - tolerance &&
    rgb.g >= 255 - tolerance &&
    rgb.b >= 255 - tolerance;
  return isNearBlack || isNearWhite;
}

/**
 * Find the nearest approved swatch to a given color.
 * Returns the swatch hex and the delta-E distance.
 */
export function findNearestSwatch(
  hex: string,
  swatches: Array<{ hexValue: string }>,
): { hexValue: string; distance: number } | null {
  if (swatches.length === 0) return null;

  let nearest = { hexValue: swatches[0].hexValue, distance: Infinity };

  for (const swatch of swatches) {
    const dist = deltaE(hex, swatch.hexValue);
    if (dist < nearest.distance) {
      nearest = { hexValue: swatch.hexValue, distance: dist };
    }
  }

  return nearest;
}
