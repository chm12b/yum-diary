import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord } from "./types";

/**
 * List the signed-in user's dining records.
 * Ordered by visit_date DESC, then created_at DESC.
 */
export async function listMyRecords(): Promise<DiningRecord[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** Return the number of dining records owned by the signed-in user. */
export async function countMyRecords(): Promise<number> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
