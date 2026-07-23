import { listRestaurants } from "./listRestaurants";

export type RestaurantLocationOptions = {
  cities: string[];
  /** Districts keyed by city. */
  districtsByCity: Record<string, string[]>;
  /** Total restaurants in group (unfiltered). */
  totalCount: number;
};

/**
 * Distinct city / district options from a group's restaurants (data-driven).
 */
export async function listRestaurantLocationOptions(
  groupId: string,
): Promise<RestaurantLocationOptions> {
  const rows = await listRestaurants(groupId);
  const citySet = new Set<string>();
  const districtsByCity: Record<string, Set<string>> = {};

  for (const row of rows) {
    const city = row.city?.trim();
    if (!city) {
      continue;
    }
    citySet.add(city);

    const district = row.district?.trim();
    if (!district) {
      continue;
    }
    if (!districtsByCity[city]) {
      districtsByCity[city] = new Set();
    }
    districtsByCity[city].add(district);
  }

  const cities = [...citySet].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  const mapped: Record<string, string[]> = {};
  for (const city of cities) {
    mapped[city] = [...(districtsByCity[city] ?? [])].sort((a, b) =>
      a.localeCompare(b, "zh-Hant"),
    );
  }

  return {
    cities,
    districtsByCity: mapped,
    totalCount: rows.length,
  };
}
