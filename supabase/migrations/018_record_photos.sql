-- =============================================================================
-- Migration : 018_record_photos.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.record_photos（用餐紀錄相簿；檔案在 Storage）
--
-- 依賴：
--   • 010_records.sql  → public.records（record_id FK）
--   • 002_profiles.sql → public.profiles（created_by FK）
--   • 011_storage.sql  → yum-diary bucket（實體圖檔存放處）
--
-- 本檔範圍：
--   ✅ public.record_photos 資料表
--   ✅ FK：record_id → records(id) ON DELETE CASCADE
--   ✅ FK：created_by → profiles(id) ON DELETE SET NULL
--   ✅ CHECK：storage_path 非空白、photo_order >= 1
--   ✅ Index：(record_id, photo_order)
--   ❌ 不存實體圖檔（僅存 Supabase Storage path）
--   ❌ updated_at / handle_updated_at（本表僅記錄新增，不追更新時間）
--   ❌ RLS / Policy（對齊既有 migration；權限由應用層／後續 RLS 控管）
--
-- 設計重點：
--   • 日記照片採相簿（Album）：一筆 record 可對應最多 10 張照片（1:N）。
--   • 圖片本體放 yum-diary bucket；本表只保存 storage_path 與展示順序 photo_order。
--   • Storage 路徑：records/{recordId}/photo-01.webp ~ photo-10.webp
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.record_photos
-- -----------------------------------------------------------------------------

create table public.record_photos (
  id uuid primary key
    default gen_random_uuid(),

  record_id uuid not null
    references public.records (id) on delete cascade,

  storage_path text not null
    constraint record_photos_storage_path_length_check
      check (
        char_length(btrim(storage_path)) >= 1
      ),

  photo_order integer not null
    default 1
    constraint record_photos_photo_order_positive_check
      check (photo_order >= 1),

  created_by uuid
    references public.profiles (id) on delete set null,

  created_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.record_photos is
  '用餐紀錄相簿。圖檔存 yum-diary bucket；本表保存 storage_path 與順序 photo_order。';

comment on column public.record_photos.id is
  '日記照片列主鍵；預設 gen_random_uuid()。';

comment on column public.record_photos.record_id is
  '所屬用餐紀錄；FK → public.records(id) ON DELETE CASCADE。';

comment on column public.record_photos.storage_path is
  'Supabase Storage 路徑（非完整 URL）；例：records/{recordId}/photo-01.webp。';

comment on column public.record_photos.photo_order is
  '相簿順序（1 起算）；預設 1。';

comment on column public.record_photos.created_by is
  '新增者；FK → public.profiles(id) ON DELETE SET NULL；可為 NULL。';

comment on column public.record_photos.created_at is
  '建立時間（UTC timestamptz）。';


create index record_photos_record_id_photo_order_idx
  on public.record_photos (record_id, photo_order);
