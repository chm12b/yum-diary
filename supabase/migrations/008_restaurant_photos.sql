-- =============================================================================
-- Migration : 008_restaurant_photos.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.restaurant_photos（餐廳多圖；檔案在 Storage）
--
-- 依賴：
--   • 007_restaurants.sql → public.restaurants
--
-- 本檔範圍：
--   ✅ public.restaurant_photos 資料表
--   ✅ FK：restaurant_id → restaurants(id) ON DELETE CASCADE
--   ✅ CHECK：storage_path 非空白
--   ❌ 不存實體圖檔（僅存 Supabase Storage path）
--   ❌ taken_by / source / google_photo_reference
--   ❌ RLS / Policy
--   ❌ 額外 Index（FK 自動產生者除外）
--   ❌ updated_at / handle_updated_at（本表欄位清單不含 updated_at）
--
-- 設計重點：
--   • 一間餐廳可有多列照片（1:N）
--   • 圖片本體放 Storage；本表只保存 storage_path 與展示用中繼資料
--   • is_cover 標記封面；「同一餐廳僅一張封面」可之後再以 partial unique 強化
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.restaurant_photos
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--       獨立照片列主鍵，方便之後引用與排序調整。
--
--   • restaurant_id → public.restaurants(id) ON DELETE CASCADE
--       餐廳刪除時一併清除照片列，避免孤兒關聯。
--       （Storage 物件清除可另以應用層／lifecycle 處理。）
--
--   • storage_path TEXT NOT NULL
--       Supabase Storage 物件路徑（例如 bucket/object key），非完整 CDN URL。
--       CHECK：btrim 後長度至少 1。
--
--   • caption TEXT NULL
--       可選圖說；不強制。
--
--   • is_cover BOOLEAN NOT NULL DEFAULT FALSE
--       是否為封面圖；預設 false。
--
--   • created_at TIMESTAMPTZ
--       上傳／建立時間（UTC）。
--
--   刻意不包含：
--     • taken_by — 之後若需拍攝者再擴充
--     • source — 避免過早綁定 Google／手動來源枚舉
--     • google_photo_reference — Google 專用欄位延後，保持表精簡
-- -----------------------------------------------------------------------------

create table public.restaurant_photos (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  storage_path text not null
    constraint restaurant_photos_storage_path_length_check
      check (
        char_length(btrim(storage_path)) >= 1
      ),

  caption text
    constraint restaurant_photos_caption_length_check
      check (
        caption is null
        or char_length(caption) <= 200
      ),

  is_cover boolean not null
    default false,

  created_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.restaurant_photos is
  '餐廳照片中繼資料。圖檔存 Supabase Storage；本表保存 storage_path 與展示欄位。';

comment on column public.restaurant_photos.id is
  '照片列主鍵；預設 gen_random_uuid()。';

comment on column public.restaurant_photos.restaurant_id is
  '所屬餐廳；FK → public.restaurants(id) ON DELETE CASCADE。';

comment on column public.restaurant_photos.storage_path is
  'Supabase Storage 路徑（非完整 URL）；btrim 後不可為空。';

comment on column public.restaurant_photos.caption is
  '可選圖說；最長 200 字元。';

comment on column public.restaurant_photos.is_cover is
  '是否為封面；預設 false。';

comment on column public.restaurant_photos.created_at is
  '建立時間（UTC timestamptz）。';
