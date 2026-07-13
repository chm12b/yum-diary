import type {
  GoogleApiErrorPayload,
  GoogleSearchTextResponse,
} from "./types";

const PLACES_API_BASE = "https://places.googleapis.com/v1";

export const SEARCH_TEXT_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.primaryType",
  "places.location",
  "places.rating",
  "places.userRatingCount",
].join(",");

/** Place Details field mask — no `places.` prefix (single Place object). */
export const PLACE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
  "photos",
  "location",
  "primaryType",
].join(",");

export function getGoogleMapsApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key ? key : null;
}

type PlacesFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      googleStatus?: string;
    };

/**
 * Shared Places API (New) fetch helper.
 * Search / Detail / Photo routes reuse this with different path + field mask.
 */
export async function fetchPlacesApi<
  T extends GoogleApiErrorPayload = GoogleSearchTextResponse,
>(
  path: string,
  options: {
    method?: "GET" | "POST";
    fieldMask: string;
    body?: Record<string, unknown>;
  },
): Promise<PlacesFetchResult<T>> {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "GOOGLE_MAPS_API_KEY is not configured",
      googleStatus: "MISSING_API_KEY",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${PLACES_API_BASE}${path}`, {
      method: options.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": options.fieldMask,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Failed to reach Google Places API",
    };
  }

  let payload = {} as T;

  try {
    payload = (await response.json()) as T;
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Google Places API returned an invalid response",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        payload.error?.message ??
        `Google Places API request failed (${response.status})`,
      googleStatus: payload.error?.status,
    };
  }

  return { ok: true, data: payload };
}
