-- =============================================================================
-- Migration : 020_invite_join_rpc.sql
-- Project   : Yum Diary
-- Purpose   : 邀請連結預覽與加入群組 RPC（不改 table schema）
--
-- 依賴：
--   • 002_profiles.sql / 004_groups.sql / 005_group_members.sql
--
-- 本檔範圍：
--   ✅ public.get_invite_preview(p_invite_code) → group_id, group_name, owner_name
--   ✅ public.join_group(p_invite_code) → uuid（group id）
--   ✅ GRANT：preview → anon + authenticated；join → authenticated
--   ❌ 不改 table / RLS policy
--
-- 設計原因：
--   groups SELECT RLS 僅允許 owner / 成員；非成員無法以 invite_code 查詢。
--   邀請預覽與加入必須以 SECURITY DEFINER 在可控範圍內讀寫。
-- =============================================================================


-- -----------------------------------------------------------------------------
-- get_invite_preview：依邀請碼回傳群組名稱與建立者顯示名（可匿名登入）
-- -----------------------------------------------------------------------------
create or replace function public.get_invite_preview(p_invite_code text)
returns table (
  group_id uuid,
  group_name text,
  owner_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(btrim(coalesce(p_invite_code, '')));
begin
  if v_code !~ '^[A-Z0-9]{6}$' then
    return;
  end if;

  return query
  select
    g.id,
    g.name,
    coalesce(p.display_name, '未知')
  from public.groups g
  join public.profiles p on p.id = g.owner_id
  where g.invite_code = v_code
    and g.is_archived = false
  limit 1;
end;
$$;

comment on function public.get_invite_preview(text) is
  '依 invite_code 預覽群組（名稱、建立者）。SECURITY DEFINER；不暴露 invite_code 以外欄位。';

revoke all on function public.get_invite_preview(text) from public;
grant execute on function public.get_invite_preview(text) to anon;
grant execute on function public.get_invite_preview(text) to authenticated;


-- -----------------------------------------------------------------------------
-- join_group：以邀請碼加入群組並切換 current_group_id
-- -----------------------------------------------------------------------------
create or replace function public.join_group(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_invite_code, '')));
  v_group_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'Invalid invite code';
  end if;

  select g.id
    into v_group_id
  from public.groups g
  where g.invite_code = v_code
    and g.is_archived = false;

  if v_group_id is null then
    raise exception 'Invite not found';
  end if;

  insert into public.group_members (group_id, profile_id, role)
  values (v_group_id, v_user_id, 'member')
  on conflict (group_id, profile_id) do nothing;

  update public.profiles
  set current_group_id = v_group_id
  where id = v_user_id;

  return v_group_id;
end;
$$;

comment on function public.join_group(text) is
  '以 invite_code 加入群組（若尚未是成員）、切換 current_group_id，回傳 group id。';

revoke all on function public.join_group(text) from public;
grant execute on function public.join_group(text) to authenticated;
