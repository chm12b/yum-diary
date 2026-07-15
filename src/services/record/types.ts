import type { Database } from "@/src/types/database";

export type CreateRecordInput = {
  restaurantId: string;
  visitDate: string;
  rating: number;
  notes: string;
};

export type UpdateRecordInput = {
  visitDate: string;
  rating: number;
  notes: string;
};

export type DiningRecord =
  Database["public"]["Tables"]["records"]["Row"];

export type DiningRecordInsert =
  Database["public"]["Tables"]["records"]["Insert"];
