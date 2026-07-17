import type { AuthError, PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";
import { setCurrentGroupId } from "@/src/services/profile/profile.service";

export type GroupResult<T> = {
  data: T;
  error: PostgrestError | AuthError | null;
};

export type CreateGroupInput = {
  groupName: string;
  inviteCode: string;
};

export type CreateGroupData = string | null;

export type CurrentGroup = {
  id: string;
  name: string;
  inviteCode: string;
  referenceName: string;
  referenceLat: number;
  referenceLng: number;
};

export type GroupListItem = {
  id: string;
  name: string;
};

export type GroupDetail = {
  id: string;
  name: string;
  memberCount: number;
  isOwner: boolean;
  inviteCode: string;
};

export type GroupMemberListItem = {
  profileId: string;
  displayName: string;
  isOwner: boolean;
  isCurrentUser: boolean;
};

type GroupMemberQueryRow = {
  profile_id: string;
  role: string;
  profiles: { display_name: string | null } | null;
};

const UNKNOWN_MEMBER_NAME = "未知成員";

export async function createGroup({
  groupName,
  inviteCode,
}: CreateGroupInput): Promise<GroupResult<CreateGroupData>> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("create_group", {
    p_group_name: groupName,
    p_invite_code: inviteCode,
  });

  return { data, error };
}

/**
 * Load a single group the signed-in user can access, with member count and
 * whether the current user is the group owner.
 */
export async function getGroupDetail(
  groupId: string,
): Promise<GroupResult<GroupDetail | null>> {
  const id = groupId.trim();
  if (!id) {
    return { data: null, error: null };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }

  if (!user) {
    return { data: null, error: null };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, owner_id, is_archived, invite_code")
    .eq("id", id)
    .maybeSingle();

  if (groupError) {
    return { data: null, error: groupError };
  }

  if (!group || group.is_archived) {
    return { data: null, error: null };
  }

  const { count, error: countError } = await supabase
    .from("group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", id);

  if (countError) {
    return { data: null, error: countError };
  }

  return {
    data: {
      id: group.id,
      name: group.name,
      memberCount: count ?? 0,
      isOwner: group.owner_id === user.id,
      inviteCode: group.invite_code,
    },
    error: null,
  };
}

/**
 * List a group's members in join order.
 * Uses one relational query to load each profile display name and role.
 */
export async function listGroupMembers(
  groupId: string,
): Promise<GroupResult<GroupMemberListItem[]>> {
  const id = groupId.trim();
  if (!id) {
    return { data: [], error: null };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: [], error: userError };
  }

  if (!user) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("group_members")
    .select("profile_id, role, profiles(display_name)")
    .eq("group_id", id)
    .order("joined_at", { ascending: true });

  if (error) {
    return { data: [], error };
  }

  const rows = (data ?? []) as unknown as GroupMemberQueryRow[];

  return {
    data: rows.map((row) => {
      const displayName = row.profiles?.display_name?.trim() ?? "";

      return {
        profileId: row.profile_id,
        displayName: displayName || UNKNOWN_MEMBER_NAME,
        isOwner: row.role === "owner",
        isCurrentUser: row.profile_id === user.id,
      };
    }),
    error: null,
  };
}

/**
 * List groups the signed-in user can access (member or owner via RLS).
 * Excludes archived groups. Ordered by created_at ASC.
 */
export async function listMyGroups(): Promise<GroupResult<GroupListItem[]>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: [], error: userError };
  }

  if (!user) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("groups")
    .select("id, name")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    })),
    error: null,
  };
}

export async function getCurrentGroup(): Promise<
  GroupResult<CurrentGroup | null>
> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }

  if (!user) {
    return { data: null, error: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { data: null, error: profileError };
  }

  if (!profile.current_group_id) {
    return { data: null, error: null };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, invite_code, reference_name, reference_lat, reference_lng")
    .eq("id", profile.current_group_id)
    .single();

  if (groupError) {
    return { data: null, error: groupError };
  }

  return {
    data: {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      referenceName: group.reference_name,
      referenceLat: group.reference_lat,
      referenceLng: group.reference_lng,
    },
    error: null,
  };
}

/**
 * Switch the signed-in user's current group (profiles.current_group_id).
 * Verifies the target group is accessible before updating.
 */
export async function switchCurrentGroup(
  groupId: string,
): Promise<GroupResult<CurrentGroup | null>> {
  const id = groupId.trim();
  if (!id) {
    return { data: null, error: null };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }

  if (!user) {
    return { data: null, error: null };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .eq("id", id)
    .eq("is_archived", false)
    .maybeSingle();

  if (groupError) {
    return { data: null, error: groupError };
  }

  if (!group) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Group not found",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  const { error: updateError } = await setCurrentGroupId(user.id, id);

  if (updateError) {
    return { data: null, error: updateError };
  }

  return getCurrentGroup();
}

export type InvitePreview = {
  groupId: string;
  groupName: string;
  ownerName: string;
};

/**
 * Preview a group by invite code (works for anon via SECURITY DEFINER RPC).
 * Returns null when the code is invalid / not found.
 */
export async function getInvitePreview(
  inviteCode: string,
): Promise<GroupResult<InvitePreview | null>> {
  const code = inviteCode.trim().toUpperCase();
  if (!code) {
    return { data: null, error: null };
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_invite_preview", {
    p_invite_code: code,
  });

  if (error) {
    return { data: null, error };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.group_id) {
    return { data: null, error: null };
  }

  return {
    data: {
      groupId: row.group_id,
      groupName: row.group_name,
      ownerName: row.owner_name,
    },
    error: null,
  };
}

/**
 * Join a group by invite code, switch current_group_id, return group id.
 */
export async function joinGroupByInviteCode(
  inviteCode: string,
): Promise<GroupResult<string | null>> {
  const code = inviteCode.trim().toUpperCase();
  if (!code) {
    return { data: null, error: null };
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("join_group", {
    p_invite_code: code,
  });

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? null, error: null };
}
