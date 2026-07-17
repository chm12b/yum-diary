-- =============================================================================
-- Migration : 022_leave_group_rpc.sql
-- Project   : Yum Diary
-- Purpose   : 一般成員離開群組 RPC（不改 table schema / 不改既有 RLS policy）
--
-- 依賴：
--   • 002_profiles.sql / 004_groups.sql / 005_group_members.sql
--
-- 本檔範圍：
--   ✅ public.leave_group(p_group_id) → uuid（新的 current_group_id；無則 null）
--   ✅ GRANT：authenticated
--   ❌ 不改 table / 既有 RLS policy
--
-- 設計原因：
--   group_members 目前僅有 SELECT / INSERT policy，成員無法直接 DELETE 自己的列。
--   離開群組以 SECURITY DEFINER 在可控條件下刪除成員列並切換 current_group_id。
-- =============================================================================


create or replace function public.leave_group(p_group_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
  v_deleted int := 0;
  v_next_group_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_group_id is null then
    raise exception 'Missing group id';
  end if;

  select g.owner_id
    into v_owner_id
  from public.groups g
  where g.id = p_group_id
    and g.is_archived = false;

  if v_owner_id is null then
    raise exception 'Group not found';
  end if;

  if v_owner_id = v_user_id then
    raise exception 'Owner cannot leave group';
  end if;

  delete from public.group_members
  where group_id = p_group_id
    and profile_id = v_user_id;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'Not a group member';
  end if;

  select gm.group_id
    into v_next_group_id
  from public.group_members gm
  join public.groups g
    on g.id = gm.group_id
  where gm.profile_id = v_user_id
    and g.is_archived = false
  order by gm.joined_at asc
  limit 1;

  update public.profiles
  set current_group_id = v_next_group_id
  where id = v_user_id;

  return v_next_group_id;
end;
$$;

comment on function public.leave_group(uuid) is
  '一般成員離開群組：刪除自己的 group_members，切換 current_group_id 至最早加入的其他群組（若無則 null）。Owner 不可離開。';

revoke all on function public.leave_group(uuid) from public;
grant execute on function public.leave_group(uuid) to authenticated;
