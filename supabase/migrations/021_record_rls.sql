-- =============================================================================
-- Migration : 021_record_rls.sql
-- Project   : Yum Diary
-- Purpose   : 為 record_photos / record_foods 啟用 RLS（補齊 Security Advisor）
--
-- 依賴：
--   • 016_enable_rls.sql → public.can_access_restaurant(uuid)
--   • 018_record_photos.sql → public.record_photos
--   • 019_record_foods.sql → public.record_foods
--   • 010_records.sql → public.records
--
-- 本檔範圍：
--   ✅ alter table … enable row level security
--   ✅ SELECT / INSERT / UPDATE / DELETE policies（對齊 records）
--   ❌ 不改 table schema / 不新增 column / 不新增 helper
--
-- Policy 對齊 records：
--   • SELECT：同群組可讀（經 parent record → restaurant → can_access_restaurant）
--   • INSERT：僅作者本人（created_by = auth.uid()）且可寫入該 record
--   • UPDATE / DELETE：僅作者本人（created_by = auth.uid()）
-- =============================================================================


-- =============================================================================
-- record_photos（用餐紀錄相簿）
-- =============================================================================
alter table public.record_photos enable row level security;

drop policy if exists "record_photos_select" on public.record_photos;
create policy "record_photos_select"
  on public.record_photos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.records r
      where r.id = record_photos.record_id
        and public.can_access_restaurant(r.restaurant_id)
    )
  );

drop policy if exists "record_photos_insert" on public.record_photos;
create policy "record_photos_insert"
  on public.record_photos
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.records r
      where r.id = record_photos.record_id
        and r.user_id = auth.uid()
        and public.can_access_restaurant(r.restaurant_id)
    )
  );

drop policy if exists "record_photos_update" on public.record_photos;
create policy "record_photos_update"
  on public.record_photos
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "record_photos_delete" on public.record_photos;
create policy "record_photos_delete"
  on public.record_photos
  for delete
  to authenticated
  using (created_by = auth.uid());


-- =============================================================================
-- record_foods（用餐紀錄點餐內容）
-- =============================================================================
alter table public.record_foods enable row level security;

drop policy if exists "record_foods_select" on public.record_foods;
create policy "record_foods_select"
  on public.record_foods
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.records r
      where r.id = record_foods.record_id
        and public.can_access_restaurant(r.restaurant_id)
    )
  );

drop policy if exists "record_foods_insert" on public.record_foods;
create policy "record_foods_insert"
  on public.record_foods
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.records r
      where r.id = record_foods.record_id
        and r.user_id = auth.uid()
        and public.can_access_restaurant(r.restaurant_id)
    )
  );

drop policy if exists "record_foods_update" on public.record_foods;
create policy "record_foods_update"
  on public.record_foods
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "record_foods_delete" on public.record_foods;
create policy "record_foods_delete"
  on public.record_foods
  for delete
  to authenticated
  using (created_by = auth.uid());
