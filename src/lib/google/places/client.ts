import type {
  GoogleApiErrorPayload,
  GoogleSearchTextResponse,
} from "./types";

const PLACES_API_BASE = "https://places.googleapis.com/v1";

/** Prefer Traditional Chinese place names / addresses across all Places calls. */
const PLACES_LANGUAGE_CODE = "zh-TW";
const PLACES_REGION_CODE = "TW";

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
  "rating",
  "userRatingCount",
  "priceLevel",
  "priceRange",
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
  const method = options.method ?? "POST";

  let url = `${PLACES_API_BASE}${path}`;
  let body: Record<string, unknown> | undefined = options.body;

  if (method === "GET") {
    const separator = path.includes("?") ? "&" : "?";
    url = `${url}${separator}languageCode=${encodeURIComponent(PLACES_LANGUAGE_CODE)}&regionCode=${encodeURIComponent(PLACES_REGION_CODE)}`;
  } else {
    body = {
      ...(options.body ?? {}),
      languageCode: PLACES_LANGUAGE_CODE,
      regionCode: PLACES_REGION_CODE,
    };
  }

  try {
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": options.fieldMask,
        "X-Goog-Language-Code": PLACES_LANGUAGE_CODE,
        "X-Goog-Region-Code": PLACES_REGION_CODE,
      },
      body: body ? JSON.stringify(body) : undefined,
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
