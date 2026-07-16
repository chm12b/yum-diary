import { createClient } from "@/src/lib/supabase/client";
import { deletePhoto } from "@/src/services/storage";

import type { DeleteMenuPhotoInput } from "./types";

/**
 * Delete a menu photo: remove the DB row first (so the UI stops referencing a
 * missing file), then best-effort remove the Storage object.
 * Throws on validation / database / storage errors.
 */
export async function deleteMenuPhoto(
  input: DeleteMenuPhotoInput,
): Promise<void> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const supabase = createClient();

  const { error } = await supabase.from("menu_photos").delete().eq("id", id);

  if (error) {
    throw error;
  }

  const storagePath = input.storagePath?.trim() ?? "";
  if (storagePath) {
    await deletePhoto(storagePath);
  }
}
