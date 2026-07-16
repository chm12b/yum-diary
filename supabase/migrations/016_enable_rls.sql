-- =============================================================================
-- Migration : 016_enable_rls.sql
-- Project   : Yum Diary
-- Purpose   : 為所有應用資料表啟用 Row Level Security 並建立群組優先權限 policy
--
-- 依賴：
--   • 002_profiles.sql       → public.profiles
--   • 004_groups.sql         → public.groups
--   • 005_group_members.sql  → public.group_members
--   • 006_create_group_rpc.sql → public.create_group()（SECURITY INVOKER）
--   • 007_restaurants.sql    → public.restaurants
--   • 008_restaurant_photos.sql → public.restaurant_photos
--   • 010_records.sql        → public.records
--   • 013_menu_photos.sql    → public.menu_photos
--   • auth.uid()（Supabase Auth JWT）
--
-- 本檔範圍：
--   ✅ 兩個 SECURITY DEFINER helper（避免 group_members policy 自我遞迴）
--   ✅ 七張應用表 ENABLE ROW LEVEL SECURITY
--   ✅ 每張表的 SELECT / INSERT / UPDATE / DELETE policy
--   ❌ 不修改任何欄位或資料
--   ❌ 不觸碰 storage.objects（已於 011_storage.sql 設定）
--
-- 命名說明：
--   • 原需求檔名為 015_enable_rls.sql，但 015 已被 015_group_reference_location.sql
--     佔用，故改用 016 以避免同號覆蓋。
--
-- 設計原則（群組優先 / Group-first）：
--   • 可存取某列的條件 = 「目前使用者是該列所屬 group 的成員」。
--   • records 特例：同群組成員「可讀」，但僅作者本人「可寫」（新增／修改／刪除）。
--   • profiles：可讀自己與「同群組成員」的 profile（供顯示成員名稱）。
--   • 所有 policy 僅授予 authenticated；anon（未登入）一律無法存取。
--   • service_role 具 BYPASSRLS，後端管理操作不受影響。
--
-- 冪等性：
--   • 函式使用 create or replace。
--   • enable row level security 可重複執行不報錯。
--   • policy 一律先 drop policy if exists 再 create，確保可重跑。
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Helper: public.is_group_member(p_group_id)
--
--   判斷目前登入者是否為指定 group 的成員。
--   SECURITY DEFINER：函式內查詢 group_members 時繞過 RLS，
--   避免「group_members 的 policy 又呼叫本函式查 group_members」造成無限遞迴。
--   SET search_path = ''：鎖定路徑，內部一律 schema-qualified。
-- -----------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.profile_id = auth.uid()
  );
$$;

comment on function public.is_group_member(uuid) is
  '目前登入者是否為指定 group 成員。SECURITY DEFINER 以避免 group_members policy 遞迴。';


-- -----------------------------------------------------------------------------
-- Helper: public.shares_group_with(p_profile_id)
--
--   判斷目前登入者與指定 profile 是否至少同屬一個 group。
--   供 profiles SELECT policy 使用（顯示同群組成員名稱／頭像）。
-- -----------------------------------------------------------------------------
create or replace function public.shares_group_with(p_profile_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members me
    join public.group_members other
      on other.group_id = me.group_id
    where me.profile_id = auth.uid()
      and other.profile_id = p_profile_id
  );
$$;

comment on function public.shares_group_with(uuid) is
  '目前登入者是否與指定 profile 至少同屬一個 group。供 profiles SELECT policy 使用。';


-- -----------------------------------------------------------------------------
-- Helper: public.can_access_restaurant(p_restaurant_id)
--
--   判斷目前登入者能否存取指定餐廳（透過餐廳所屬 group 的成員關係）。
--   供 restaurant_photos / records / menu_photos 等「無 group_id、需經 restaurant 判斷」
--   的表使用。SECURITY DEFINER 直接 join，不依賴 restaurants 自身 RLS。
-- -----------------------------------------------------------------------------
create or replace function public.can_access_restaurant(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurants r
    join public.group_members gm
      on gm.group_id = r.group_id
    where r.id = p_restaurant_id
      and gm.profile_id = auth.uid()
  );
$$;

comment on function public.can_access_restaurant(uuid) is
  '目前登入者能否存取指定餐廳（依餐廳所屬 group 成員關係）。SECURITY DEFINER。';


-- Policy 表達式需以呼叫者角色評估，故 authenticated 需具備 EXECUTE 權限。
revoke all on function public.is_group_member(uuid) from public;
revoke all on function public.shares_group_with(uuid) from public;
revoke all on function public.can_access_restaurant(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;
grant execute on function public.can_access_restaurant(uuid) to authenticated;


-- =============================================================================
-- profiles
--   • SELECT：自己 or 同群組成員
--   • INSERT：自己（實際由 handle_new_user() DEFINER trigger 寫入，此為保險）
--   • UPDATE：自己（例如 create_group 更新 current_group_id）
--   • DELETE：不開放（隨 auth.users 級聯刪除，走 DEFINER 路徑）
-- =============================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.shares_group_with(id)
  );

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());


-- =============================================================================
-- groups
--   • SELECT：owner 本人 or 群組成員
--       （owner 條件確保 create_group 的 INSERT ... RETURNING 在成員列尚未建立前也能通過）
--   • INSERT：owner_id = 自己（對齊 create_group）
--   • UPDATE / DELETE：僅 owner
-- =============================================================================
alter table public.groups enable row level security;

drop policy if exists "groups_select" on public.groups;
create policy "groups_select"
  on public.groups
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_group_member(id)
  );

drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert"
  on public.groups
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "groups_update" on public.groups;
create policy "groups_update"
  on public.groups
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "groups_delete" on public.groups;
create policy "groups_delete"
  on public.groups
  for delete
  to authenticated
  using (owner_id = auth.uid());


-- =============================================================================
-- group_members
--   • SELECT：自己的成員列 or 同群組成員（可見群組名單）
--   • INSERT：profile_id = 自己（對齊 create_group 寫入 owner 列；未來 join_group）
--   • UPDATE / DELETE：暫不開放（角色管理留待後續 RPC / policy）
--
--   註：SELECT 的 profile_id = auth.uid() 條件避免依賴「成員列剛寫入」的可見性。
-- =============================================================================
alter table public.group_members enable row level security;

drop policy if exists "group_members_select" on public.group_members;
create policy "group_members_select"
  on public.group_members
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.is_group_member(group_id)
  );

drop policy if exists "group_members_insert" on public.group_members;
create policy "group_members_insert"
  on public.group_members
  for insert
  to authenticated
  with check (profile_id = auth.uid());


-- =============================================================================
-- restaurants（群組共享主檔）
--   • SELECT / UPDATE / DELETE：群組成員
--   • INSERT：群組成員 且 created_by = 自己
-- =============================================================================
alter table public.restaurants enable row level security;

drop policy if exists "restaurants_select" on public.restaurants;
create policy "restaurants_select"
  on public.restaurants
  for select
  to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "restaurants_insert" on public.restaurants;
create policy "restaurants_insert"
  on public.restaurants
  for insert
  to authenticated
  with check (
    public.is_group_member(group_id)
    and created_by = auth.uid()
  );

drop policy if exists "restaurants_update" on public.restaurants;
create policy "restaurants_update"
  on public.restaurants
  for update
  to authenticated
  using (public.is_group_member(group_id))
  with check (public.is_group_member(group_id));

drop policy if exists "restaurants_delete" on public.restaurants;
create policy "restaurants_delete"
  on public.restaurants
  for delete
  to authenticated
  using (public.is_group_member(group_id));


-- =============================================================================
-- restaurant_photos（群組共享；經 restaurant 判斷）
--   • 全部命令：可存取所屬餐廳者
-- =============================================================================
alter table public.restaurant_photos enable row level security;

drop policy if exists "restaurant_photos_select" on public.restaurant_photos;
create policy "restaurant_photos_select"
  on public.restaurant_photos
  for select
  to authenticated
  using (public.can_access_restaurant(restaurant_id));

drop policy if exists "restaurant_photos_insert" on public.restaurant_photos;
create policy "restaurant_photos_insert"
  on public.restaurant_photos
  for insert
  to authenticated
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "restaurant_photos_update" on public.restaurant_photos;
create policy "restaurant_photos_update"
  on public.restaurant_photos
  for update
  to authenticated
  using (public.can_access_restaurant(restaurant_id))
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "restaurant_photos_delete" on public.restaurant_photos;
create policy "restaurant_photos_delete"
  on public.restaurant_photos
  for delete
  to authenticated
  using (public.can_access_restaurant(restaurant_id));


-- =============================================================================
-- records（個人用餐紀錄）
--   • SELECT：同群組成員皆可讀（group-shared 可見）
--   • INSERT：作者本人 且 可存取該餐廳
--   • UPDATE / DELETE：僅作者本人
-- =============================================================================
alter table public.records enable row level security;

drop policy if exists "records_select" on public.records;
create policy "records_select"
  on public.records
  for select
  to authenticated
  using (public.can_access_restaurant(restaurant_id));

drop policy if exists "records_insert" on public.records;
create policy "records_insert"
  on public.records
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_restaurant(restaurant_id)
  );

drop policy if exists "records_update" on public.records;
create policy "records_update"
  on public.records
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "records_delete" on public.records;
create policy "records_delete"
  on public.records
  for delete
  to authenticated
  using (user_id = auth.uid());


-- =============================================================================
-- menu_photos（群組共享菜單相簿；經 restaurant 判斷）
--   • 全部命令：可存取所屬餐廳者
-- =============================================================================
alter table public.menu_photos enable row level security;

drop policy if exists "menu_photos_select" on public.menu_photos;
create policy "menu_photos_select"
  on public.menu_photos
  for select
  to authenticated
  using (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_photos_insert" on public.menu_photos;
create policy "menu_photos_insert"
  on public.menu_photos
  for insert
  to authenticated
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_photos_update" on public.menu_photos;
create policy "menu_photos_update"
  on public.menu_photos
  for update
  to authenticated
  using (public.can_access_restaurant(restaurant_id))
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_photos_delete" on public.menu_photos;
create policy "menu_photos_delete"
  on public.menu_photos
  for delete
  to authenticated
  using (public.can_access_restaurant(restaurant_id));
