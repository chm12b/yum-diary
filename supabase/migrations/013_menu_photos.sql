-- =============================================================================
-- Migration : 013_menu_photos.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.menu_photos（餐廳菜單相簿；檔案在 Storage）
--
-- 依賴：
--   • 007_restaurants.sql → public.restaurants（restaurant_id FK）
--   • 002_profiles.sql    → public.profiles（created_by FK）
--   • 011_storage.sql     → yum-diary bucket（實體圖檔存放處）
--
-- 本檔範圍：
--   ✅ public.menu_photos 資料表
--   ✅ FK：restaurant_id → restaurants(id) ON DELETE CASCADE
--   ✅ FK：created_by → profiles(id) ON DELETE SET NULL
--   ✅ CHECK：storage_path 非空白、page >= 1
--   ✅ Index：(restaurant_id, page)
--   ❌ 不存實體圖檔（僅存 Supabase Storage path）
--   ❌ updated_at / handle_updated_at（本表僅記錄新增，不追更新時間）
--   ❌ RLS / Policy（對齊既有 migration；權限由應用層／後續 RLS 控管）
--
-- 設計重點：
--   • 菜單採相簿（Album）：一間餐廳可對應多張菜單照片（1:N）。
--   • 圖片本體放 yum-diary bucket；本表只保存 storage_path 與展示順序 page。
--   • page 表示菜單頁序（1 起算）；同一餐廳可有多頁。
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.menu_photos
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--       獨立照片列主鍵，方便引用與刪除。
--
--   • restaurant_id → public.restaurants(id) ON DELETE CASCADE
--       餐廳刪除時一併清除菜單列，避免孤兒關聯。
--       （Storage 物件清除由應用層 service 負責。）
--
--   • storage_path TEXT NOT NULL
--       Supabase Storage 物件路徑（例：menus/{restaurantId}/menu-01.webp），
--       非完整 CDN URL。CHECK：btrim 後長度至少 1。
--
--   • page INT NOT NULL DEFAULT 1
--       菜單頁序；1 起算。CHECK：page >= 1。
--
--   • created_by → public.profiles(id) ON DELETE SET NULL
--       新增者；成員移除後保留菜單（設為 NULL）。可為 NULL。
--
--   • created_at TIMESTAMPTZ
--       建立時間（UTC）。
-- -----------------------------------------------------------------------------

create table public.menu_photos (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  storage_path text not null
    constraint menu_photos_storage_path_length_check
      check (
        char_length(btrim(storage_path)) >= 1
      ),

  page integer not null
    default 1
    constraint menu_photos_page_positive_check
      check (page >= 1),

  created_by uuid
    references public.profiles (id) on delete set null,

  created_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.menu_photos is
  '餐廳菜單相簿。圖檔存 yum-diary bucket；本表保存 storage_path 與頁序 page。';

comment on column public.menu_photos.id is
  '菜單照片列主鍵；預設 gen_random_uuid()。';

comment on column public.menu_photos.restaurant_id is
  '所屬餐廳；FK → public.restaurants(id) ON DELETE CASCADE。';

comment on column public.menu_photos.storage_path is
  'Supabase Storage 路徑（非完整 URL）；btrim 後不可為空。';

comment on column public.menu_photos.page is
  '菜單頁序（1 起算）；預設 1。';

comment on column public.menu_photos.created_by is
  '新增者；FK → public.profiles(id) ON DELETE SET NULL；可為 NULL。';

comment on column public.menu_photos.created_at is
  '建立時間（UTC timestamptz）。';


create index menu_photos_restaurant_id_page_idx
  on public.menu_photos (restaurant_id, page);
