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
  referenceName: string | null;
  referenceLat: number | null;
  referenceLng: number | null;
};

export type ReferenceLocation = {
  groupId: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
};

export type UpdateReferenceLocationInput = {
  name: string;
  lat: number;
  lng: number;
};

const REFERENCE_NAME_MAX = 50;

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

export type UpdateGroupNameInput = {
  groupId: string;
  name: string;
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
 * Rename a group. RLS allows only the group owner to update.
 */
export async function updateGroupName({
  groupId,
  name,
}: UpdateGroupNameInput): Promise<GroupResult<GroupDetail | null>> {
  const id = groupId.trim();
  const nextName = name.trim();

  if (!id || !nextName) {
    return { data: null, error: null };
  }

  if (nextName.length > 100) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Group name too long",
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
    return { data: null, error: userError };
  }

  if (!user) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("groups")
    .update({ name: nextName })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, name, owner_id, invite_code")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Group not found or not allowed",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
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
      id: data.id,
      name: data.name,
      memberCount: count ?? 0,
      isOwner: data.owner_id === user.id,
      inviteCode: data.invite_code,
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

/**
 * Load a group by id (data access only — no auth / profile lookup).
 */
export async function getGroup(
  groupId: string,
): Promise<GroupResult<CurrentGroup | null>> {
  const id = groupId.trim();
  if (!id) {
    return { data: null, error: null };
  }

  const supabase = createClient();
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, invite_code, reference_name, reference_lat, reference_lng")
    .eq("id", id)
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

  return getGroup(profile.current_group_id);
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

export type LeaveGroupData = {
  leftGroupName: string;
  nextGroupId: string | null;
};

/**
 * Leave a group as a non-owner member.
 * Deletes the caller's group_members row and updates current_group_id.
 * Returns the next current group id (null when none remain).
 */
export async function leaveGroup(
  groupId: string,
): Promise<GroupResult<LeaveGroupData | null>> {
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
    .select("id, name, owner_id")
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

  if (group.owner_id === user.id) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Owner cannot leave group",
        details: "",
        hint: "",
        code: "42501",
      } as PostgrestError,
    };
  }

  const { data: nextGroupId, error } = await supabase.rpc("leave_group", {
    p_group_id: id,
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      leftGroupName: group.name,
      nextGroupId: nextGroupId ?? null,
    },
    error: null,
  };
}

export type DeleteGroupData = {
  deletedGroupName: string;
  nextGroupId: string | null;
};

type DeleteGroupApiResponse = {
  data: DeleteGroupData | null;
  error: string | null;
};

/**
 * Permanently delete a group as owner.
 * The server route removes Storage objects first, then invokes the DB RPC.
 */
export async function deleteGroup(
  groupId: string,
): Promise<GroupResult<DeleteGroupData | null>> {
  const id = groupId.trim();
  if (!id) {
    return { data: null, error: null };
  }

  try {
    const response = await fetch(`/api/groups/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as DeleteGroupApiResponse;

    if (!response.ok || !payload.data) {
      return {
        data: null,
        error: {
          name: "PostgrestError",
          message: payload.error ?? "Failed to delete group",
          details: "",
          hint: "",
          code: String(response.status),
        } as PostgrestError,
      };
    }

    return { data: payload.data, error: null };
  } catch {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Failed to delete group",
        details: "",
        hint: "",
        code: "NETWORK_ERROR",
      } as PostgrestError,
    };
  }
}

/**
 * Read the current group's reference location.
 */
export async function getReferenceLocation(): Promise<
  GroupResult<ReferenceLocation | null>
> {
  const { data, error } = await getCurrentGroup();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return {
    data: {
      groupId: data.id,
      name: data.referenceName,
      lat: data.referenceLat,
      lng: data.referenceLng,
    },
    error: null,
  };
}

/**
 * Update the current group's reference location.
 * RLS allows only the group owner to update groups.
 */
export async function updateReferenceLocation({
  name,
  lat,
  lng,
}: UpdateReferenceLocationInput): Promise<
  GroupResult<ReferenceLocation | null>
> {
  const nextName = name.trim().slice(0, REFERENCE_NAME_MAX);

  if (!nextName || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { data: null, error: null };
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { data: null, error: null };
  }

  const { data: current, error: currentError } = await getCurrentGroup();

  if (currentError) {
    return { data: null, error: currentError };
  }

  if (!current) {
    return { data: null, error: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("groups")
    .update({
      reference_name: nextName,
      reference_lat: lat,
      reference_lng: lng,
    })
    .eq("id", current.id)
    .select("id, reference_name, reference_lat, reference_lng")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Group not found or not allowed",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  return {
    data: {
      groupId: data.id,
      name: data.reference_name,
      lat: data.reference_lat,
      lng: data.reference_lng,
    },
    error: null,
  };
}

/**
 * Clear the current group's reference location (set all three fields to NULL).
 */
export async function clearReferenceLocation(): Promise<
  GroupResult<ReferenceLocation | null>
> {
  const { data: current, error: currentError } = await getCurrentGroup();

  if (currentError) {
    return { data: null, error: currentError };
  }

  if (!current) {
    return { data: null, error: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("groups")
    .update({
      reference_name: null,
      reference_lat: null,
      reference_lng: null,
    })
    .eq("id", current.id)
    .select("id, reference_name, reference_lat, reference_lng")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: {
        name: "PostgrestError",
        message: "Group not found or not allowed",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  return {
    data: {
      groupId: data.id,
      name: data.reference_name,
      lat: data.reference_lat,
      lng: data.reference_lng,
    },
    error: null,
  };
}
