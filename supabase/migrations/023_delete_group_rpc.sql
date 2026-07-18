-- =============================================================================
-- Migration : 023_delete_group_rpc.sql
-- Project   : Yum Diary
-- Purpose   : Owner Hard Delete Group RPC（Storage 由 Server Route 先刪除）
--
-- 依賴：
--   • groups / group_members / restaurants / records
--   • restaurant_photos / menu_photos / record_photos / record_foods
--
-- 本檔範圍：
--   ✅ public.hard_delete_group(p_group_id, p_dry_run) → owner 的新 current_group_id
--   ✅ 僅 group owner 可執行
--   ✅ 依 FK 安全順序永久刪除群組資料
--   ✅ 修正所有受影響成員的 current_group_id
--   ❌ 不刪 Storage 實體檔（必須經 Storage API；由 Server Route 先完成）
--   ❌ 不改 table schema / RLS policy
-- =============================================================================

create or replace function public.hard_delete_group(
  p_group_id uuid,
  p_dry_run boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
  v_member_ids uuid[];
  v_profile_id uuid;
  v_next_group_id uuid;
  v_owner_next_group_id uuid;
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

  if v_owner_id <> v_user_id then
    raise exception 'Only group owner can delete group';
  end if;

  -- Server Route calls this before deleting Storage objects. It verifies that
  -- the RPC is deployed and the caller is still the owner without mutating data.
  if p_dry_run then
    return null;
  end if;

  select coalesce(array_agg(gm.profile_id), array[]::uuid[])
    into v_member_ids
  from public.group_members gm
  where gm.group_id = p_group_id;

  -- Child rows first. Storage objects have already been removed by Server Route.
  delete from public.record_photos rp
  where rp.record_id in (
    select r.id
    from public.records r
    join public.restaurants restaurant on restaurant.id = r.restaurant_id
    where restaurant.group_id = p_group_id
  );

  delete from public.menu_photos mp
  where mp.restaurant_id in (
    select restaurant.id
    from public.restaurants restaurant
    where restaurant.group_id = p_group_id
  );

  delete from public.restaurant_photos rp
  where rp.restaurant_id in (
    select restaurant.id
    from public.restaurants restaurant
    where restaurant.group_id = p_group_id
  );

  -- Ordered foods depend on records, so they must be deleted before records.
  delete from public.record_foods rf
  where rf.record_id in (
    select r.id
    from public.records r
    join public.restaurants restaurant on restaurant.id = r.restaurant_id
    where restaurant.group_id = p_group_id
  );

  delete from public.records r
  where r.restaurant_id in (
    select restaurant.id
    from public.restaurants restaurant
    where restaurant.group_id = p_group_id
  );

  delete from public.restaurants
  where group_id = p_group_id;

  delete from public.group_members
  where group_id = p_group_id;

  delete from public.groups
  where id = p_group_id;

  -- Heal current_group_id for every former member whose current group was deleted.
  foreach v_profile_id in array v_member_ids
  loop
    select gm.group_id
      into v_next_group_id
    from public.group_members gm
    join public.groups g on g.id = gm.group_id
    where gm.profile_id = v_profile_id
      and g.is_archived = false
    order by gm.joined_at asc
    limit 1;

    update public.profiles
    set current_group_id = v_next_group_id
    where id = v_profile_id
      and current_group_id = p_group_id;

    if v_profile_id = v_user_id then
      v_owner_next_group_id := v_next_group_id;
    end if;

    v_next_group_id := null;
  end loop;

  -- Catch-all: clear any leftover pointer to the deleted group.
  update public.profiles
  set current_group_id = null
  where current_group_id = p_group_id;

  return v_owner_next_group_id;
end;
$$;

comment on function public.hard_delete_group(uuid, boolean) is
  'Owner hard-deletes a group and all relational data after Server Route removes Storage objects. Repairs current_group_id for affected members.';

revoke all on function public.hard_delete_group(uuid, boolean) from public;
grant execute on function public.hard_delete_group(uuid, boolean) to authenticated;
