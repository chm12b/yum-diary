import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord } from "./types";

/**
 * Fetch one dining record visible to the signed-in user (same-group read via RLS).
 * Returns null when unauthenticated or not found / not accessible.
 */
export async function getRecord(
  recordId: string,
): Promise<DiningRecord | null> {
  const id = recordId.trim();
  if (!id) {
    return null;
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
