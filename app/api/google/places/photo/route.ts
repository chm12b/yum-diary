import {
  fetchPlacesApi,
  getGoogleMapsApiKey,
} from "@/src/lib/google/places/client";
import { placesErrorResponse } from "@/src/lib/google/places/errors";

/**
 * Streams a Google Place photo for UI preview only.
 * Does not write to Storage.
 */
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim();

  if (!name) {
    return placesErrorResponse("Missing photo name", 400);
  }

  if (!name.startsWith("places/") || !name.includes("/photos/")) {
    return placesErrorResponse("Invalid photo name", 400);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return placesErrorResponse("GOOGLE_MAPS_API_KEY is not configured", 500);
  }

  let response: Response;

  try {
    response = await fetch(
      `https://places.googleapis.com/v1/${name}/media?maxHeightPx=800&maxWidthPx=800`,
      {
        headers: { "X-Goog-Api-Key": apiKey },
        cache: "no-store",
        redirect: "follow",
      },
    );
  } catch {
    return placesErrorResponse("Failed to reach Google Places Photo API", 502);
  }

  if (!response.ok) {
    return placesErrorResponse("Failed to load Google place photo", response.status);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
