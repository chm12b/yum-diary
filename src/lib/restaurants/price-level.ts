/**
 * Format a Google price level (0–4) into dollar signs.
 * 0 → "$", 1 → "$$", … 4 → "$$$$$". Returns null when unavailable / out of range.
 */
export function formatPriceLevel(
  level: number | null | undefined,
): string | null {
  if (level == null || !Number.isFinite(level)) {
    return null;
  }
  const clamped = Math.min(4, Math.max(0, Math.round(level)));
  return "$".repeat(clamped + 1);
}

/**
 * Format a per-person price range (from Google priceRange) into "$200–400".
 * Handles open-ended ranges ("$200+") and returns null when there is no amount.
 */
export function formatPriceAmount(
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  const low = typeof min === "number" && min > 0 ? min : null;
  const high = typeof max === "number" && max > 0 ? max : null;

  if (low == null && high == null) {
    return null;
  }
  if (low != null && high != null) {
    return low === high ? `$${low}` : `$${low}–${high}`;
  }
  if (low != null) {
    return `$${low}+`;
  }
  return `$${high}`;
}

/**
 * Prefer the concrete per-person amount ("$200–400"); fall back to the
 * price-level symbols ("$$") when only the level is available.
 */
export function resolvePriceLabel(restaurant: {
  priceMin?: number | null;
  priceMax?: number | null;
  priceLevel?: number | null;
}): string | null {
  return (
    formatPriceAmount(restaurant.priceMin, restaurant.priceMax) ??
    formatPriceLevel(restaurant.priceLevel)
  );
}
