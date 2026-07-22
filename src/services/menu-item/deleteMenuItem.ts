import { createClient } from "@/src/lib/supabase/client";

import type { DeleteMenuItemInput } from "./types";

/**
 * Delete a menu item by id.
 */
export async function deleteMenuItem(
  input: DeleteMenuItemInput,
): Promise<void> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const supabase = createClient();

  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
