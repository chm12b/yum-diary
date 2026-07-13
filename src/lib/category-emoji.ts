import type { RestaurantCategoryId } from "@/src/lib/restaurant-types";

const categoryEmojis: Record<Exclude<RestaurantCategoryId, "all">, string> = {
  japanese: "🍜",
  chinese: "🍚",
  snacks: "🥟",
  coffee: "☕",
  desserts: "🍰",
};

export function getCategoryEmoji(
  category: Exclude<RestaurantCategoryId, "all">,
): string {
  return categoryEmojis[category];
}
