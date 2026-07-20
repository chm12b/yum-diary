import type { GooglePlace, PlaceSearchItem } from "./types";

export function mapGooglePlaceToSearchItem(
  place: GooglePlace,
): PlaceSearchItem | null {
  if (!place.id) {
    return null;
  }

  return {
    id: place.id,
    name: place.displayName?.text?.trim() || "",
    address: place.formattedAddress?.trim() || "",
    category: place.primaryType ?? null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    photo: place.photos?.[0]?.name ?? null,
  };
}

export function mapGooglePlacesToSearchItems(
  places: GooglePlace[] | undefined,
): PlaceSearchItem[] {
  if (!places?.length) {
    return [];
  }

  return places
    .map(mapGooglePlaceToSearchItem)
    .filter((item): item is PlaceSearchItem => item !== null);
}
