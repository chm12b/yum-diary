import {
  fetchPlacesApi,
  SEARCH_TEXT_FIELD_MASK,
} from "@/src/lib/google/places/client";
import {
  placesErrorResponse,
  placesSuccessResponse,
} from "@/src/lib/google/places/errors";
import { mapGooglePlacesToSearchItems } from "@/src/lib/google/places/map-search-result";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return placesErrorResponse("Request body must be valid JSON", 400);
  }

  const query =
    typeof body === "object" &&
    body !== null &&
    "query" in body &&
    typeof (body as { query: unknown }).query === "string"
      ? (body as { query: string }).query.trim()
      : "";

  if (!query) {
    return placesErrorResponse('Missing or empty "query" field', 400);
  }

  const result = await fetchPlacesApi("/places:searchText", {
    method: "POST",
    fieldMask: SEARCH_TEXT_FIELD_MASK,
    body: { textQuery: query },
  });

  if (!result.ok) {
    if (result.googleStatus === "MISSING_API_KEY") {
      return placesErrorResponse(result.message, 500);
    }

    if (result.status >= 400 && result.status < 500) {
      return placesErrorResponse(result.message, result.status);
    }

    return placesErrorResponse(result.message, 502);
  }

  const data = mapGooglePlacesToSearchItems(result.data.places);

  if (data.length === 0) {
    return placesErrorResponse("No places found for this query", 404);
  }

  return placesSuccessResponse(data);
}
