import { parseAddress } from "@/src/lib/address";
import type {
  PlaceDetailItem,
  PlaceSearchItem,
  PlacesApiResponse,
} from "@/src/lib/google/places/types";

/**
 * Auto Geocoding result — coordinates only.
 * Never includes google_place_id: matching a nearby Place for lat/lng
 * must not bind the restaurant to that Place.
 */
export type GeocodeResult = {
  success: boolean;
  latitude: number | null;
  longitude: number | null;
  matchedAddress: string | null;
};

const FAILED_RESULT: GeocodeResult = {
  success: false,
  latitude: null,
  longitude: null,
  matchedAddress: null,
};

/**
 * City (and district when present) must agree between the user address
 * and a Google Places candidate. Reject when city cannot be confirmed.
 */
export function isGeocodeAddressMatch(
  inputAddress: string,
  candidateAddress: string,
): boolean {
  const input = parseAddress(inputAddress);
  const candidate = parseAddress(candidateAddress);

  if (!input.city || !candidate.city) {
    return false;
  }

  if (input.city !== candidate.city) {
    return false;
  }

  if (input.district) {
    if (!candidate.district || candidate.district !== input.district) {
      return false;
    }
  }

  return true;
}

function pickBestSearchMatch(
  inputAddress: string,
  candidates: PlaceSearchItem[],
): PlaceSearchItem | null {
  for (const candidate of candidates) {
    if (isGeocodeAddressMatch(inputAddress, candidate.address)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Resolve an address to coordinates via existing Google Places
 * (Text Search → best match → Place Detail).
 *
 * Returns latitude / longitude only. Does not expose or bind place_id —
 * Auto Geocoding must not treat the matched Place as this restaurant.
 *
 * Never throws — failures return success: false for Create / Update / Retry.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const trimmed = typeof address === "string" ? address.trim() : "";
  if (!trimmed) {
    return { ...FAILED_RESULT };
  }

  try {
    const searchResponse = await fetch("/api/google/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed }),
    });

    let searchPayload: PlacesApiResponse<PlaceSearchItem[]>;
    try {
      searchPayload =
        (await searchResponse.json()) as PlacesApiResponse<PlaceSearchItem[]>;
    } catch {
      console.debug("[geocodeAddress] invalid search response JSON");
      return { ...FAILED_RESULT };
    }

    if (
      !searchResponse.ok ||
      searchPayload.error ||
      !searchPayload.data?.length
    ) {
      console.debug(
        "[geocodeAddress] search failed",
        searchPayload.error ?? searchResponse.status,
      );
      return { ...FAILED_RESULT };
    }

    const best = pickBestSearchMatch(trimmed, searchPayload.data);
    if (!best) {
      console.debug(
        "[geocodeAddress] no candidate matched city/district",
        trimmed,
      );
      return { ...FAILED_RESULT };
    }

    const detailResponse = await fetch(
      `/api/google/places/${encodeURIComponent(best.id)}`,
    );

    let detailPayload: PlacesApiResponse<PlaceDetailItem>;
    try {
      detailPayload =
        (await detailResponse.json()) as PlacesApiResponse<PlaceDetailItem>;
    } catch {
      console.debug("[geocodeAddress] invalid detail response JSON");
      return { ...FAILED_RESULT };
    }

    if (!detailResponse.ok || detailPayload.error || !detailPayload.data) {
      console.debug(
        "[geocodeAddress] detail failed",
        detailPayload.error ?? detailResponse.status,
      );
      return { ...FAILED_RESULT };
    }

    const detail = detailPayload.data;
    const matchedAddress = detail.address?.trim() || best.address || null;

    if (
      !matchedAddress ||
      !isGeocodeAddressMatch(trimmed, matchedAddress)
    ) {
      console.debug(
        "[geocodeAddress] detail address failed city/district match",
        matchedAddress,
      );
      return { ...FAILED_RESULT };
    }

    if (detail.latitude == null || detail.longitude == null) {
      console.debug("[geocodeAddress] detail missing coordinates");
      return { ...FAILED_RESULT };
    }

    return {
      success: true,
      latitude: detail.latitude,
      longitude: detail.longitude,
      matchedAddress,
    };
  } catch (error) {
    console.debug("[geocodeAddress] unexpected error", error);
    return { ...FAILED_RESULT };
  }
}
