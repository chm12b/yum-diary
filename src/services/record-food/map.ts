import type { RecordFood, RecordFoodRow } from "./types";

/** Map a DB row to the UI record food model. */
export function toRecordFood(row: RecordFoodRow): RecordFood {
  return {
    id: row.id,
    recordId: row.record_id,
    name: row.name,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}
