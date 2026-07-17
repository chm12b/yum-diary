import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";

export type ProfileResult<T> = {
  data: T;
  error: PostgrestError | null;
};

export type CurrentGroupIdData = {
  current_group_id: string | null;
};

export async function getCurrentGroupId(
  userId: string,
): Promise<ProfileResult<CurrentGroupIdData | null>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", userId)
    .single();

  if (error) {
    return { data: null, error };
  }

  return {
    data: data as CurrentGroupIdData,
    error: null,
  };
}

/**
 * Update the signed-in user's profiles.current_group_id.
 * Caller must ensure groupId is a group the user can access.
 */
export async function setCurrentGroupId(
  userId: string,
  groupId: string,
): Promise<ProfileResult<CurrentGroupIdData | null>> {
  const id = userId.trim();
  const nextGroupId = groupId.trim();
  if (!id || !nextGroupId) {
    throw new Error("Missing required field");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ current_group_id: nextGroupId })
    .eq("id", id)
    .select("current_group_id")
    .single();

  if (error) {
    return { data: null, error };
  }

  return {
    data: data as CurrentGroupIdData,
    error: null,
  };
}
