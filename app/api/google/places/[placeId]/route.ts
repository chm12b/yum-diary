import {
  fetchPlacesApi,
  PLACE_DETAILS_FIELD_MASK,
} from "@/src/lib/google/places/client";
import {
  placesErrorResponse,
  placesSuccessResponse,
} from "@/src/lib/google/places/errors";
import {
  mapGooglePlaceToDetailItem,
  normalizePlaceId,
} from "@/src/lib/google/places/map-place-detail";
import type { GooglePlaceDetailsResponse } from "@/src/lib/google/places/types";

type RouteContext = {
  params: Promise<{ placeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { placeId: rawPlaceId } = await context.params;
  const placeId = normalizePlaceId(decodeURIComponent(rawPlaceId ?? ""));

  if (!placeId) {
    return placesErrorResponse("Missing placeId", 400);
  }

  const result = await fetchPlacesApi<GooglePlaceDetailsResponse>(
    `/places/${encodeURIComponent(placeId)}`,
    {
      method: "GET",
      fieldMask: PLACE_DETAILS_FIELD_MASK,
    },
  );

  if (!result.ok) {
    if (result.googleStatus === "MISSING_API_KEY") {
      return placesErrorResponse(result.message, 500);
    }

    if (result.status === 404) {
      return placesErrorResponse("Place not found", 404);
    }

    if (result.status >= 400 && result.status < 500) {
      return placesErrorResponse(result.message, result.status);
    }

    return placesErrorResponse(result.message, 502);
  }

  const data = mapGooglePlaceToDetailItem(result.data);

  if (!data) {
    return placesErrorResponse("Place not found", 404);
  }

  return placesSuccessResponse(data);
}
