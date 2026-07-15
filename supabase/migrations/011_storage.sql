-- =============================================================================
-- Migration : 011_storage.sql
-- Project   : Yum Diary
-- Purpose   : 建立 Storage Foundation（單一 Public Bucket：yum-diary）
--
-- 依賴：
--   • Supabase Storage（storage.buckets / storage.objects）
--
-- 本檔範圍：
--   ✅ 建立單一 public bucket：yum-diary
--   ✅ storage.objects RLS policy（讀取公開；寫入限 authenticated）
--   ❌ 不建立多個 bucket
--   ❌ 不建立 folder（Storage folder 為虛擬前綴，隨物件上傳自然產生）
--   ❌ 不做圖片壓縮 / 轉檔
--   ❌ 不新增任何 Photo / Upload UI
--
-- 產品原則（Group-first）：
--   • Restaurant / Diary / Photo / Menu 皆以 Group 為共享資料。
--   • Storage 僅負責「圖片存放」；真正的存取權限由 Database RLS 控制。
--   • 因此 Storage policy 僅做粗粒度控管（公開讀取、登入者可寫入），
--     細粒度群組權限交由對應資料表（restaurants / records …）的 RLS 把關。
--
-- Path Convention（object key，不含 bucket 前綴）：
--   • restaurants/{restaurantId}/cover.webp
--   • restaurants/{restaurantId}/photo-01.webp
--   • records/{recordId}/photo-01.webp
--   • menus/{restaurantId}/menu-01.webp
--   • （保留未來擴充：avatars/、groups/，本次不實作）
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Bucket: yum-diary（public）
--
-- 設計說明：
--   • 單一 bucket 承載所有圖片；以 object key 前綴區分用途（folder 為虛擬）。
--   • public = true：物件可經公開 URL 讀取（對齊 restaurant_photos 只存 path、
--     前端以 public URL 顯示的模式）。
--   • on conflict do nothing：重複執行時保持冪等。
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('yum-diary', 'yum-diary', true)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- Policies: storage.objects（限定 bucket_id = 'yum-diary'）
--
-- 說明：
--   • storage.objects 預設已啟用 RLS；此處僅新增本 bucket 專屬 policy。
--   • SELECT：anon + authenticated 皆可讀（public bucket 亦可經 CDN 直接讀取）。
--   • INSERT / UPDATE / DELETE：限 authenticated；細部群組歸屬由 DB RLS 控管。
--   • drop policy if exists：確保重複執行時可安全重建。
-- -----------------------------------------------------------------------------

drop policy if exists "yum-diary public read" on storage.objects;
create policy "yum-diary public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'yum-diary');

drop policy if exists "yum-diary authenticated insert" on storage.objects;
create policy "yum-diary authenticated insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'yum-diary');

drop policy if exists "yum-diary authenticated update" on storage.objects;
create policy "yum-diary authenticated update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'yum-diary')
  with check (bucket_id = 'yum-diary');

drop policy if exists "yum-diary authenticated delete" on storage.objects;
create policy "yum-diary authenticated delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'yum-diary');
