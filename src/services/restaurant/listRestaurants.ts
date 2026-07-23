import {
  distanceMetersOrZero,
  type GeoPoint,
} from "@/src/lib/restaurants/distance";
import { resolveOpenStatus } from "@/src/lib/restaurants/open-status";
import { createClient } from "@/src/lib/supabase/client";

import type {
  ListRestaurantsInput,
  RestaurantFilter,
  RestaurantSort,
} from "./filter-types";
import { DEFAULT_RESTAURANT_SORT } from "./filter-types";
import type { RestaurantRecord } from "./types";

export type { ListRestaurantsInput, RestaurantFilter, RestaurantSort };
export { DEFAULT_RESTAURANT_SORT };

function normalizeInput(
  groupIdOrOptions: string | ListRestaurantsInput,
): Required<Pick<ListRestaurantsInput, "groupId">> &
  Omit<ListRestaurantsInput, "groupId"> & { sort: RestaurantSort } {
  if (typeof groupIdOrOptions === "string") {
    // Legacy call sites: keep historical default (newest).
    return {
      groupId: groupIdOrOptions,
      sort: "newest",
    };
  }

  return {
    ...groupIdOrOptions,
    sort: groupIdOrOptions.sort ?? DEFAULT_RESTAURANT_SORT,
  };
}

function matchesSearch(row: RestaurantRecord, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) {
    return true;
  }

  const haystacks = [row.name, row.address, row.city, row.district];
  return haystacks.some((value) =>
    (value ?? "").toLowerCase().includes(q),
  );
}

function sortByDistance(
  rows: RestaurantRecord[],
  reference: GeoPoint | null | undefined,
): RestaurantRecord[] {
  if (!reference) {
    // No reference point — fall back to newest (created_at DESC).
    return [...rows].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }

  return [...rows].sort((a, b) => {
    const da = distanceMetersOrZero(
      { lat: a.latitude, lng: a.longitude },
      reference,
    );
    const db = distanceMetersOrZero(
      { lat: b.latitude, lng: b.longitude },
      reference,
    );

    // Missing coords (0) go last.
    const aMissing = a.latitude == null || a.longitude == null;
    const bMissing = b.latitude == null || b.longitude == null;
    if (aMissing !== bMissing) {
      return aMissing ? 1 : -1;
    }

    if (da !== db) {
      return da - db;
    }

    return a.name.localeCompare(b.name, "zh-Hant");
  });
}

function applyClientSort(
  rows: RestaurantRecord[],
  sort: RestaurantSort,
  referencePoint: GeoPoint | null | undefined,
): RestaurantRecord[] {
  switch (sort) {
    case "distance":
      return sortByDistance(rows, referencePoint);
    case "newest":
      return [...rows].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    case "name":
      return [...rows].sort((a, b) =>
        a.name.localeCompare(b.name, "zh-Hant"),
      );
    case "rating_desc":
      return [...rows].sort((a, b) => {
        const ra = a.google_rating;
        const rb = b.google_rating;
        if (ra == null && rb == null) {
          return a.name.localeCompare(b.name, "zh-Hant");
        }
        if (ra == null) {
          return 1;
        }
        if (rb == null) {
          return -1;
        }
        if (rb !== ra) {
          return rb - ra;
        }
        return a.name.localeCompare(b.name, "zh-Hant");
      });
    case "rating_asc":
      return [...rows].sort((a, b) => {
        const ra = a.google_rating;
        const rb = b.google_rating;
        if (ra == null && rb == null) {
          return a.name.localeCompare(b.name, "zh-Hant");
        }
        if (ra == null) {
          return 1;
        }
        if (rb == null) {
          return -1;
        }
        if (ra !== rb) {
          return ra - rb;
        }
        return a.name.localeCompare(b.name, "zh-Hant");
      });
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

/**
 * List restaurants for a group with optional filter / sort / search.
 *
 * Backward compatible:
 * - `listRestaurants(groupId)` — same as before (newest)
 * - `listRestaurants({ groupId, filter, sort, search, referencePoint })`
 *
 * openStatus uses existing resolveOpenStatus() — does not re-implement hours logic.
 */
export async function listRestaurants(
  groupIdOrOptions: string | ListRestaurantsInput,
): Promise<RestaurantRecord[]> {
  const options = normalizeInput(groupIdOrOptions);
  const groupId = options.groupId.trim();
  if (!groupId) {
    return [];
  }

  const filter = options.filter;
  const search = options.search?.trim() ?? "";

  const supabase = createClient();
  let query = supabase
    .from("restaurants")
    .select("*")
    .eq("group_id", groupId);

  const city = filter?.city?.trim();
  if (city) {
    query = query.eq("city", city);
  }

  const district = filter?.district?.trim();
  if (district) {
    query = query.eq("district", district);
  }

  const category = filter?.category?.trim();
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // Fetch unordered (or stable newest); apply sort/search in one place below.
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  let rows = data ?? [];

  if (search) {
    rows = rows.filter((row) => matchesSearch(row, search));
  }

  const openStatus = filter?.openStatus;
  if (openStatus) {
    // Unknown / 未提供 always included — we cannot confirm they are closed.
    rows = rows.filter((row) => {
      const status = resolveOpenStatus(row.business_hours);
      return status === openStatus || status === "unknown";
    });
  }

  const maxDistanceMeters = filter?.maxDistanceMeters;
  if (typeof maxDistanceMeters === "number" && maxDistanceMeters > 0) {
    const reference = options.referencePoint;
    // No reference / missing coords ⇒ distance does not exist ⇒ exclude.
    rows = rows.filter((row) => {
      if (!reference || row.latitude == null || row.longitude == null) {
        return false;
      }
      const meters = distanceMetersOrZero(
        { lat: row.latitude, lng: row.longitude },
        reference,
      );
      return meters <= maxDistanceMeters;
    });
  }

  return applyClientSort(rows, options.sort, options.referencePoint);
}
