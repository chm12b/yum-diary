import type {
  RestaurantFilter,
  RestaurantSort,
} from "@/src/services/restaurant/filter-types";

/** Home「逛逛附近餐廳」→ Restaurant List 預設條件。 */
export const NEARBY_QUICK_BROWSE_FILTER: RestaurantFilter = {
  openStatus: "open",
  city: "台南市",
  district: "安定區",
};

export const NEARBY_QUICK_BROWSE_SORT: RestaurantSort = "distance";

/** Query flag used by Home → `/restaurants?nearby=1`. */
export const NEARBY_QUICK_BROWSE_QUERY = "nearby";
