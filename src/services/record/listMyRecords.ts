import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord } from "./types";

type RecordWithRestaurantJoin = DiningRecord & {
  restaurants?: unknown;
};

function toDiningRecord(row: RecordWithRestaurantJoin): DiningRecord {
  const { restaurants, ...record } = row;
  void restaurants;
  return record;
}

/**
 * List the signed-in user's dining records in their current group.
 * Scoped via restaurants.group_id (= profiles.current_group_id).
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile.current_group_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("records")
    .select("*, restaurants!inner(id)")
    .eq("user_id", user.id)
    .eq("restaurants.group_id", profile.current_group_id)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as RecordWithRestaurantJoin[]).map(toDiningRecord);
}

/**
 * Return the number of dining records owned by the signed-in user
 * in their current group.
 */
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile.current_group_id) {
    return 0;
  }

  const { count, error } = await supabase
    .from("records")
    .select("id, restaurants!inner(id)", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("restaurants.group_id", profile.current_group_id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
