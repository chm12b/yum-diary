-- =============================================================================
-- Migration : 029_group_order_participants.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.group_order_participants（共同點餐參與者 Foundation）
--
-- 依賴：
--   • 002_profiles.sql    → public.profiles（user_id FK）
--   • 016_enable_rls.sql  → public.is_group_member(uuid)
--   • 027_group_orders.sql → public.group_orders（group_order_id FK）
--
-- 本檔範圍：
--   ✅ public.can_access_group_order(uuid) helper
--   ✅ public.group_order_participants 資料表
--   ✅ FK：group_order_id / user_id
--   ✅ UNIQUE (group_order_id, user_id)
--   ✅ Index：(group_order_id, joined_at)
--   ✅ RLS：群組成員可讀；本人可建立自己的 participant
--   ❌ order_items / menu selection / summary / history
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Helper: public.can_access_group_order(p_group_order_id)
--
--   判斷目前登入者能否存取指定揪團點餐（透過 group_orders.group_id 成員關係）。
--   SECURITY DEFINER：直接 join，不依賴 group_orders 自身 RLS。
-- -----------------------------------------------------------------------------

create or replace function public.can_access_group_order(p_group_order_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_orders go
    join public.group_members gm
      on gm.group_id = go.group_id
    where go.id = p_group_order_id
      and gm.profile_id = auth.uid()
  );
$$;

comment on function public.can_access_group_order(uuid) is
  '目前登入者能否存取指定揪團點餐（依 group_orders 所屬 group 成員關係）。SECURITY DEFINER。';

revoke all on function public.can_access_group_order(uuid) from public;
grant execute on function public.can_access_group_order(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- Table: public.group_order_participants
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--
--   • group_order_id → public.group_orders(id) ON DELETE CASCADE
--       點餐活動刪除時一併清除參與者。
--
--   • user_id → public.profiles(id) ON DELETE CASCADE
--       參與者本人。
--
--   • joined_at
--       加入時間；預設建立當下。
--
--   • created_at
--       列建立時間。
--
--   • UNIQUE (group_order_id, user_id)
--       同一場點餐每位使用者最多一筆。
-- -----------------------------------------------------------------------------

create table public.group_order_participants (
  id uuid primary key
    default gen_random_uuid(),

  group_order_id uuid not null
    references public.group_orders (id) on delete cascade,

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  joined_at timestamptz not null
    default timezone('utc', now()),

  created_at timestamptz not null
    default timezone('utc', now()),

  constraint group_order_participants_group_order_id_user_id_key
    unique (group_order_id, user_id)
);

comment on table public.group_order_participants is
  '揪團點餐參與者。一場活動每位使用者最多一列；本表不含 order_items。';

comment on column public.group_order_participants.id is
  '參與列主鍵；預設 gen_random_uuid()。';

comment on column public.group_order_participants.group_order_id is
  '所屬點餐活動；FK → public.group_orders(id) ON DELETE CASCADE。';

comment on column public.group_order_participants.user_id is
  '參與者；FK → public.profiles(id) ON DELETE CASCADE。';

comment on column public.group_order_participants.joined_at is
  '加入時間（UTC timestamptz）。';

comment on column public.group_order_participants.created_at is
  '建立時間（UTC timestamptz）。';


create index group_order_participants_group_order_id_joined_at_idx
  on public.group_order_participants (group_order_id, joined_at);


-- -----------------------------------------------------------------------------
-- RLS
--   • SELECT：群組成員（經 can_access_group_order）
--   • INSERT：本人 + 可存取該點餐活動
-- -----------------------------------------------------------------------------

alter table public.group_order_participants enable row level security;

drop policy if exists "group_order_participants_select" on public.group_order_participants;
create policy "group_order_participants_select"
  on public.group_order_participants
  for select
  to authenticated
  using (public.can_access_group_order(group_order_id));

drop policy if exists "group_order_participants_insert" on public.group_order_participants;
create policy "group_order_participants_insert"
  on public.group_order_participants
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_group_order(group_order_id)
  );
