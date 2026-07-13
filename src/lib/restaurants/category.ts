/**
 * Canonical Yum Diary restaurant categories.
 * Create / Edit / Filter / Statistics should all use this list.
 */
export const APP_CATEGORIES = [
  "早餐",
  "小吃",
  "飲料",
  "日式",
  "中式",
  "韓式",
  "南洋",
  "西式",
  "火鍋",
  "甜點",
  "其他",
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

const DEFAULT_CATEGORY: AppCategory = "其他";

/**
 * Maps Google Places `primaryType` → Yum Diary `AppCategory`.
 * Database stores only AppCategory values, never Google types.
 */
export const GOOGLE_CATEGORY_MAP: Record<string, AppCategory> = {
  // 早餐
  breakfast_restaurant: "早餐",
  brunch_restaurant: "早餐",

  // 小吃
  fast_food_restaurant: "小吃",
  meal_takeaway: "小吃",

  // 飲料
  cafe: "飲料",
  coffee_shop: "飲料",
  bubble_tea_store: "飲料",
  juice_shop: "飲料",

  // 日式
  japanese_restaurant: "日式",
  sushi_restaurant: "日式",
  ramen_restaurant: "日式",
  udon_noodle_restaurant: "日式",
  izakaya_restaurant: "日式",

  // 中式
  chinese_restaurant: "中式",
  dumpling_restaurant: "中式",
  noodle_shop: "中式",

  // 韓式
  korean_restaurant: "韓式",

  // 南洋
  thai_restaurant: "南洋",
  vietnamese_restaurant: "南洋",
  malaysian_restaurant: "南洋",
  indonesian_restaurant: "南洋",

  // 西式
  italian_restaurant: "西式",
  pizza_restaurant: "西式",
  hamburger_restaurant: "西式",
  american_restaurant: "西式",
  steak_house: "西式",

  // 火鍋
  hot_pot_restaurant: "火鍋",

  // 甜點
  dessert_restaurant: "甜點",
  bakery: "甜點",
  ice_cream_shop: "甜點",
  pastry_shop: "甜點",
};

/**
 * Convert Google Places `primaryType` to a Yum Diary category.
 * Unknown / empty types fall back to "其他".
 */
export function mapGoogleCategory(primaryType?: string): AppCategory {
  if (!primaryType) {
    return DEFAULT_CATEGORY;
  }

  const key = primaryType.trim().toLowerCase();
  if (!key) {
    return DEFAULT_CATEGORY;
  }

  return GOOGLE_CATEGORY_MAP[key] ?? DEFAULT_CATEGORY;
}
