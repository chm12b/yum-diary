export type GeoPoint = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_M = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in meters between two lat/lng points. */
export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return Math.round(EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

/** Human-friendly distance label: meters under 1km, else km with one decimal. */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }
  return `${distanceMeters}m`;
}

/**
 * Distance in meters from a restaurant point to the group reference point.
 * Returns 0 when either coordinate is missing (caller hides the value).
 */
export function distanceMetersOrZero(
  point: { lat: number | null; lng: number | null },
  reference: GeoPoint | null,
): number {
  if (!reference || point.lat == null || point.lng == null) {
    return 0;
  }
  return haversineMeters({ lat: point.lat, lng: point.lng }, reference);
}
