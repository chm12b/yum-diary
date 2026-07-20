import {
  fetchPlacesApi,
} from "@/src/lib/google/places/client";
import {
  mapGooglePlacesToSearchItems,
} from "@/src/lib/google/places/map-search-result";
import {
  placesErrorResponse,
  placesSuccessResponse,
} from "@/src/lib/google/places/errors";

const SEARCH_NEARBY_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.primaryType",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.photos.name",
].join(",");

type NearbyRequestBody = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxResultCount?: number;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return placesErrorResponse("Request body must be valid JSON", 400);
  }

  const parsed =
    typeof body === "object" && body !== null
      ? (body as NearbyRequestBody)
      : null;

  const latitude = parsed?.latitude;
  const longitude = parsed?.longitude;
  const radiusMeters = parsed?.radiusMeters;
  const maxResultCount = parsed?.maxResultCount ?? 20;

  if (
    latitude == null ||
    longitude == null ||
    radiusMeters == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(radiusMeters) ||
    radiusMeters <= 0
  ) {
    return placesErrorResponse("Invalid request body", 400);
  }

  const result = await fetchPlacesApi("/places:searchNearby", {
    method: "POST",
    fieldMask: SEARCH_NEARBY_FIELD_MASK,
    body: {
      includedTypes: ["restaurant"],
      maxResultCount,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radiusMeters,
        },
      },
    },
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
    return placesErrorResponse("No places found for this area", 404);
  }

  return placesSuccessResponse(data);
}

