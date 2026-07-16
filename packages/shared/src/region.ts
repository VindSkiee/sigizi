/**
 * Normalize region name to DB format (UPPER_SNAKE_CASE).
 *
 * DB stores: "JAWA_BARAT", "PURWAKARTA"
 * Dropdown sends: "Jawa Barat", "Kab. Purwakarta"
 *
 * IMPORTANT: All region values (province, regency, district) MUST be
 * written in consistent format before querying the database.
 * Use this function to normalize any region input.
 *
 * Supported input formats:
 * - "Jawa Barat" / "jawa barat" / "JAWA BARAT" → "JAWA_BARAT"
 * - "Kab. Purwakarta" / "Kota Bandung" → "PURWAKARTA" / "BANDUNG"
 */
export function normalizeRegion(value: string): string {
  return value
    .trim()
    .replace(/^(Kab\.?|Kota)\s+/i, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

export function matchesRegion(value: string, expected: string): boolean {
  const a = normalizeRegion(value);
  const b = normalizeRegion(expected);
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Convert DB region format to human-readable display.
 * "JAWA_BARAT" → "Jawa Barat"
 * "CIREBON" → "Cirebon"
 * "DKI_JAKARTA" → "Dki Jakarta"
 */
export function denormalizeRegion(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
