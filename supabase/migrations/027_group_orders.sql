-- =============================================================================
-- Migration : 027_group_orders.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.group_orders（揪團點餐活動 Foundation）
--
-- 依賴：
--   • 001_base.sql        → public.handle_updated_at()
--   • 002_profiles.sql    → public.profiles（created_by FK）
--   • 003_groups.sql      → public.groups（group_id FK）
--   • 007_restaurants.sql → public.restaurants（restaurant_id FK）
--   • 016_enable_rls.sql  → public.is_group_member(uuid)
--                           public.can_access_restaurant(uuid)
--
-- 本檔範圍：
--   ✅ public.group_orders 資料表
--   ✅ FK：group_id / restaurant_id / created_by
--   ✅ CHECK：title 非空白、status ∈ OPEN|CLOSED|COMPLETED
--   ✅ Index：(group_id, status)、(group_id, created_at desc)
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ✅ RLS（沿用 Restaurant 權限：群組成員 + restaurant 可存取）
--   ❌ participants / order_items / share / join / summary / history
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.group_orders
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--
--   • group_id → public.groups(id) ON DELETE CASCADE
--       群組刪除時一併清除點餐活動。
--
--   • restaurant_id → public.restaurants(id) ON DELETE CASCADE
--       餐廳刪除時一併清除點餐活動。
--
--   • title TEXT NOT NULL
--       點餐活動標題。
--
--   • description TEXT NULL
--       選填說明。
--
--   • status TEXT NOT NULL DEFAULT 'OPEN'
--       OPEN → CLOSED → COMPLETED。
--
--   • close_at TIMESTAMPTZ NOT NULL
--       截止時間。
--
--   • created_by → public.profiles(id) ON DELETE RESTRICT
--       Host（發起人）。
--
--   • created_at / updated_at
--       updated_at 由 handle_updated_at trigger 維護。
-- -----------------------------------------------------------------------------

create table public.group_orders (
  id uuid primary key
    default gen_random_uuid(),

  group_id uuid not null
    references public.groups (id) on delete cascade,

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  title text not null
    constraint group_orders_title_length_check
      check (
        char_length(btrim(title)) between 1 and 100
      ),

  description text
    constraint group_orders_description_length_check
      check (
        description is null
        or char_length(btrim(description)) between 1 and 500
      ),

  status text not null
    default 'OPEN'
    constraint group_orders_status_check
      check (status in ('OPEN', 'CLOSED', 'COMPLETED')),

  close_at timestamptz not null,

  created_by uuid not null
    references public.profiles (id) on delete restrict,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.group_orders is
  '揪團點餐活動。一場活動對應一間餐廳；本表不含 participants / order_items。';

comment on column public.group_orders.id is
  '點餐活動主鍵；預設 gen_random_uuid()。';

comment on column public.group_orders.group_id is
  '所屬群組；FK → public.groups(id) ON DELETE CASCADE。';

comment on column public.group_orders.restaurant_id is
  '點餐餐廳；FK → public.restaurants(id) ON DELETE CASCADE。';

comment on column public.group_orders.title is
  '活動標題；btrim 後長度 1~100。';

comment on column public.group_orders.description is
  '選填說明；非 NULL 時 btrim 後長度 1~500。';

comment on column public.group_orders.status is
  '活動狀態：OPEN / CLOSED / COMPLETED。';

comment on column public.group_orders.close_at is
  '截止時間（UTC timestamptz）。';

comment on column public.group_orders.created_by is
  '發起人（Host）；FK → public.profiles(id) ON DELETE RESTRICT。';

comment on column public.group_orders.created_at is
  '建立時間（UTC timestamptz）。';

comment on column public.group_orders.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


create index group_orders_group_id_status_idx
  on public.group_orders (group_id, status);

create index group_orders_group_id_created_at_idx
  on public.group_orders (group_id, created_at desc);


create trigger trg_group_orders_updated_at
  before update on public.group_orders
  for each row
  execute function public.handle_updated_at();


-- -----------------------------------------------------------------------------
-- RLS：沿用 Restaurant 權限模型
--   • 讀寫：群組成員（is_group_member）
--   • INSERT：群組成員 + 可存取該餐廳 + created_by = 自己
-- -----------------------------------------------------------------------------

alter table public.group_orders enable row level security;

drop policy if exists "group_orders_select" on public.group_orders;
create policy "group_orders_select"
  on public.group_orders
  for select
  to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "group_orders_insert" on public.group_orders;
create policy "group_orders_insert"
  on public.group_orders
  for insert
  to authenticated
  with check (
    public.is_group_member(group_id)
    and public.can_access_restaurant(restaurant_id)
    and created_by = auth.uid()
  );

drop policy if exists "group_orders_update" on public.group_orders;
create policy "group_orders_update"
  on public.group_orders
  for update
  to authenticated
  using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

drop policy if exists "group_orders_delete" on public.group_orders;
create policy "group_orders_delete"
  on public.group_orders
  for delete
  to authenticated
  using (public.is_group_member(group_id));
