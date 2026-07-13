import type { RestaurantCategoryId } from "@/src/lib/restaurant-types";

const categoryEmojis: Record<string, string> = {
  japanese: "🍜",
  chinese: "🍚",
  snacks: "🥟",
  coffee: "☕",
  desserts: "🍰",
  日式: "🍜",
  中式: "🍚",
  小吃: "🥟",
  飲料: "☕",
  甜點: "🍰",
  早餐: "🍳",
  韓式: "🥘",
  南洋: "🍛",
  西式: "🍝",
  火鍋: "🍲",
  其他: "🍽️",
};

export function getCategoryEmoji(
  category: Exclude<RestaurantCategoryId, "all"> | string,
): string {
  return categoryEmojis[category] ?? "🍽️";
}
