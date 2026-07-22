import type { GeoPoint } from "@/src/lib/restaurants/distance";

/** Number of cells along one edge of the search grid (3 → 3×3 = 9 centers). */
export const GRID_SIZE = 3;

/**
 * Offset distance as a fraction of the search radius.
 * Centers are spaced `radiusMeters * GRID_OFFSET_FACTOR` apart.
 */
export const GRID_OFFSET_FACTOR = 0.6;

const EARTH_RADIUS_M = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Offset a lat/lng point by north/east meters using spherical Earth math.
 * Does not mutate latitude/longitude by raw addition of meters.
 */
export function offsetLatLngMeters(
  origin: GeoPoint,
  northMeters: number,
  eastMeters: number,
): GeoPoint {
  const latRad = toRadians(origin.lat);

  const newLat = origin.lat + toDegrees(northMeters / EARTH_RADIUS_M);
  const cosLat = Math.cos(latRad);
  const newLng =
    cosLat === 0
      ? origin.lng
      : origin.lng + toDegrees(eastMeters / (EARTH_RADIUS_M * cosLat));

  return { lat: newLat, lng: newLng };
}

/**
 * Build a GRID_SIZE × GRID_SIZE search-center grid around `origin`.
 * Row-major order: north→south, west→east (e.g. NW first, SE last).
 */
export function buildNearbySearchGrid(
  origin: GeoPoint,
  radiusMeters: number,
): GeoPoint[] {
  const half = Math.floor(GRID_SIZE / 2);
  const stepMeters = radiusMeters * GRID_OFFSET_FACTOR;
  const centers: GeoPoint[] = [];

  for (let row = -half; row <= half; row += 1) {
    for (let col = -half; col <= half; col += 1) {
      const northMeters = -row * stepMeters;
      const eastMeters = col * stepMeters;
      centers.push(offsetLatLngMeters(origin, northMeters, eastMeters));
    }
  }

  return centers;
}

export const GRID_CELL_COUNT = GRID_SIZE * GRID_SIZE;
