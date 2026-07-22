import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";

export type ProfileResult<T> = {
  data: T;
  error: PostgrestError | null;
};

export type CurrentGroupIdData = {
  current_group_id: string | null;
};

export type MyProfileData = {
  displayName: string;
  createdAt: string;
};

const UNKNOWN_MEMBER_LABEL = "未知成員";
const DISPLAY_NAME_MAX = 50;

/**
 * Display name for the signed-in user.
 * Returns null when unauthenticated or display_name is blank.
 */
export async function getMyDisplayName(): Promise<string | null> {
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
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const trimmed = data?.display_name?.trim() ?? "";
  return trimmed || null;
}

/**
 * Load the signed-in user's profile fields for the Personal Profile page.
 */
export async function getMyProfile(): Promise<ProfileResult<MyProfileData | null>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return {
    data: {
      displayName: data.display_name?.trim() ?? "",
      createdAt: data.created_at,
    },
    error: null,
  };
}

/**
 * Update the signed-in user's display_name (1–50 chars after trim).
 */
export async function updateMyDisplayName(
  displayName: string,
): Promise<ProfileResult<MyProfileData | null>> {
  const nextName = displayName.trim();

  if (!nextName || nextName.length > DISPLAY_NAME_MAX) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Invalid display name",
        details: "",
        hint: "",
        code: "22001",
      } as PostgrestError,
    };
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
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: nextName })
    .eq("id", user.id)
    .select("display_name, created_at")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Profile not found or not allowed",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  return {
    data: {
      displayName: data.display_name?.trim() ?? "",
      createdAt: data.created_at,
    },
    error: null,
  };
}

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
 * Resolve display names for profile ids (same-group readable via RLS).
 * Missing / blank display_name → 「未知成員」. Never returns user ids.
 */
export async function listProfileDisplayNames(
  profileIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [
    ...new Set(profileIds.map((id) => id.trim()).filter(Boolean)),
  ];
  const names = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return names;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", uniqueIds);

  if (error) {
    throw error;
  }

  for (const id of uniqueIds) {
    names.set(id, UNKNOWN_MEMBER_LABEL);
  }

  for (const row of data ?? []) {
    const trimmed = row.display_name?.trim() ?? "";
    names.set(row.id, trimmed || UNKNOWN_MEMBER_LABEL);
  }

  return names;
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
