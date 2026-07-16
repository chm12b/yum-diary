import type { Database } from "@/src/types/database";

export type RecordFoodRow =
  Database["public"]["Tables"]["record_foods"]["Row"];

export type RecordFoodInsert =
  Database["public"]["Tables"]["record_foods"]["Insert"];

/** UI-facing ordered food item. */
export type RecordFood = {
  id: string;
  recordId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
};

/** Max food items per record for the MVP. */
export const RECORD_FOODS_MAX = 20;

/** Max characters per food name. */
export const RECORD_FOOD_NAME_MAX = 50;
