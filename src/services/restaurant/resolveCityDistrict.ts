import { parseAddress } from "@/src/lib/address";

/**
 * Derive city / district from an address via the shared Address Parser.
 * Empty / unparseable addresses return nulls — never throws.
 */
export function resolveCityDistrict(address: string | null | undefined): {
  city: string | null;
  district: string | null;
} {
  const trimmed = address?.trim() ?? "";
  if (!trimmed) {
    return { city: null, district: null };
  }

  return parseAddress(trimmed);
}
