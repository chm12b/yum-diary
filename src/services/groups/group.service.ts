import type { AuthError, PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";

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
};

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
    .select("id, name, invite_code")
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
    },
    error: null,
  };
}
