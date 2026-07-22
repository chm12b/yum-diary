import { createClient } from "@/src/lib/supabase/client";
import { listRestaurants } from "@/src/services/restaurant/listRestaurants";
import type { RestaurantRecord } from "@/src/services/restaurant";

export type FrequentRestaurantItem = {
  restaurant: RestaurantRecord;
  visitCount: number;
  lastVisitDate: string;
  rank: number;
};

export type VisitAgg = {
  visitCount: number;
  lastVisitDate: string;
};

type VisitSourceRow = {
  restaurant_id: string;
  visit_date: string;
};

/** One Visit = one restaurant on one calendar day (restaurant_id + visit_date). */
function visitKey(restaurantId: string, visitDate: string): string {
  return `${restaurantId}|${visitDate}`;
}

/**
 * Aggregate unique visits from dining-record rows.
 *
 * Rule: same restaurant_id + same visit_date counts as 1 visit,
 * regardless of how many records (people) exist that day.
 *
 * Future: swap this for a Dining Event source without changing callers / UI.
 */
export function aggregateVisitsFromRecords(
  rows: readonly VisitSourceRow[],
): Map<string, VisitAgg> {
  const seenVisits = new Set<string>();
  const agg = new Map<string, VisitAgg>();

  for (const row of rows) {
    const restaurantId = row.restaurant_id;
    const visitDate = row.visit_date;
    const key = visitKey(restaurantId, visitDate);

    if (seenVisits.has(key)) {
      continue;
    }
    seenVisits.add(key);

    const existing = agg.get(restaurantId);
    if (!existing) {
      agg.set(restaurantId, {
        visitCount: 1,
        lastVisitDate: visitDate,
      });
      continue;
    }

    existing.visitCount += 1;
    if (visitDate > existing.lastVisitDate) {
      existing.lastVisitDate = visitDate;
    }
  }

  return agg;
}

/**
 * Rank restaurants in a group by unique visit count.
 * Tie-break: most recent visit_date DESC.
 * No DB aggregation — client-side over existing records.
 */
export async function listFrequentRestaurants(
  groupId: string,
): Promise<FrequentRestaurantItem[]> {
  const id = groupId.trim();
  if (!id) {
    return [];
  }

  const restaurants = await listRestaurants(id);
  if (restaurants.length === 0) {
    return [];
  }

  const restaurantIds = restaurants.map((row) => row.id);
  const restaurantById = new Map(
    restaurants.map((row) => [row.id, row] as const),
  );

  const supabase = createClient();
  const { data, error } = await supabase
    .from("records")
    .select("restaurant_id, visit_date")
    .in("restaurant_id", restaurantIds);

  if (error) {
    throw error;
  }

  const agg = aggregateVisitsFromRecords(data ?? []);

  const ranked = [...agg.entries()]
    .map(([restaurantId, stats]) => {
      const restaurant = restaurantById.get(restaurantId);
      if (!restaurant) {
        return null;
      }
      return {
        restaurant,
        visitCount: stats.visitCount,
        lastVisitDate: stats.lastVisitDate,
      };
    })
    .filter(
      (item): item is {
        restaurant: RestaurantRecord;
        visitCount: number;
        lastVisitDate: string;
      } => item != null,
    )
    .sort((a, b) => {
      if (b.visitCount !== a.visitCount) {
        return b.visitCount - a.visitCount;
      }
      if (a.lastVisitDate === b.lastVisitDate) {
        return 0;
      }
      return a.lastVisitDate < b.lastVisitDate ? 1 : -1;
    });

  return ranked.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
