-- =============================================================================
-- Migration : 007_restaurants.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.restaurants（群組內餐廳主檔）
--
-- 依賴：
--   • 001_base.sql     → public.handle_updated_at()
--   • 002_profiles.sql → public.profiles（created_by FK）
--   • 004_groups.sql   → public.groups（group_id FK）
--
-- 本檔範圍：
--   ✅ public.restaurants 資料表
--   ✅ FK：group_id → groups、created_by → profiles
--   ✅ CHECK：名稱／分類／價格區間／座標範圍等
--   ✅ UNIQUE(group_id, google_place_id)（允許多筆 NULL＝手動新增）
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ❌ restaurant_photos（見 008）
--   ❌ RLS / Policy
--   ❌ 額外 Index（UNIQUE／FK 自動產生者除外）
--   ❌ category lookup table（category 以 text 儲存）
--
-- 設計重點：
--   • google_place_id NULL = 手動新增；有值 = 來自 Google Places
--   • business_hours 以 jsonb 儲存多時段／公休日等彈性結構
--   • last_google_sync_at NULL = 尚未同步或純手動資料
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.restaurants
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--       資料庫產生主鍵，避免 client 自帶衝突。
--
--   • group_id → public.groups(id) ON DELETE CASCADE
--       餐廳屬於群組；群組刪除時一併清除餐廳，避免孤兒列。
--
--   • created_by → public.profiles(id) ON DELETE RESTRICT
--       記錄新增者；擁有餐廳時不可直接刪除 profile（與 groups.owner_id 精神一致）。
--
--   • name TEXT NOT NULL
--       CHECK：btrim 後 char_length 1~100。
--
--   • category TEXT NOT NULL
--       以 text 儲存分類 slug／標籤（如 japanese、chinese）；
--       不另建 category table，保持輕量；之後若需正規化再遷移。
--
--   • phone / address / website_url / notes
--       皆可 NULL；notes 長度上限 200（對齊新增餐廳表單）。
--
--   • latitude / longitude
--       double precision，可 NULL；有值時限制合理地理範圍。
--
--   • price_min / price_max
--       integer，可 NULL；兩者皆有時須 price_max >= price_min。
--
--   • google_place_id TEXT NULL
--       NULL = 手動新增；有值 = Google Place。
--       UNIQUE(group_id, google_place_id)：同一群組不重複匯入同一 Place；
--       PostgreSQL UNIQUE 允許多筆 NULL。
--
--   • business_hours jsonb NULL
--       彈性儲存營業時段、公休日等（例如 slots / closed_days）。
--       不以多表正規化，方便對齊 Google Places periods 與手動編輯。
--
--   • last_google_sync_at timestamptz NULL
--       最近一次自 Google 同步時間；手動資料可維持 NULL。
--
--   • created_at / updated_at
--       default timezone('utc', now())；updated_at 由 trigger 維護。
-- -----------------------------------------------------------------------------

create table public.restaurants (
  id uuid primary key
    default gen_random_uuid(),

  group_id uuid not null
    references public.groups (id) on delete cascade,

  created_by uuid not null
    references public.profiles (id) on delete restrict,

  name text not null
    constraint restaurants_name_length_check
      check (
        char_length(btrim(name)) between 1 and 100
      ),

  category text not null
    constraint restaurants_category_length_check
      check (
        char_length(btrim(category)) between 1 and 50
      ),

  phone text
    constraint restaurants_phone_length_check
      check (
        phone is null
        or char_length(btrim(phone)) between 1 and 40
      ),

  address text
    constraint restaurants_address_length_check
      check (
        address is null
        or char_length(btrim(address)) between 1 and 300
      ),

  website_url text
    constraint restaurants_website_url_length_check
      check (
        website_url is null
        or char_length(btrim(website_url)) between 1 and 500
      ),

  notes text
    constraint restaurants_notes_length_check
      check (
        notes is null
        or char_length(notes) <= 200
      ),

  latitude double precision
    constraint restaurants_latitude_range_check
      check (
        latitude is null
        or latitude between -90 and 90
      ),

  longitude double precision
    constraint restaurants_longitude_range_check
      check (
        longitude is null
        or longitude between -180 and 180
      ),

  price_min integer
    constraint restaurants_price_min_nonnegative_check
      check (
        price_min is null
        or price_min >= 0
      ),

  price_max integer
    constraint restaurants_price_max_nonnegative_check
      check (
        price_max is null
        or price_max >= 0
      ),

  google_place_id text
    constraint restaurants_google_place_id_length_check
      check (
        google_place_id is null
        or char_length(btrim(google_place_id)) between 1 and 255
      ),

  business_hours jsonb,

  last_google_sync_at timestamptz,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint restaurants_price_range_check
    check (
      price_min is null
      or price_max is null
      or price_max >= price_min
    ),

  constraint restaurants_group_id_google_place_id_key
    unique (group_id, google_place_id)
);

comment on table public.restaurants is
  '群組內餐廳主檔。可手動新增或綁定 Google Place；營業時間以 jsonb 儲存。';

comment on column public.restaurants.id is
  '餐廳主鍵；預設 gen_random_uuid()。';

comment on column public.restaurants.group_id is
  '所屬群組；FK → public.groups(id) ON DELETE CASCADE。';

comment on column public.restaurants.created_by is
  '新增者 profile；FK → public.profiles(id) ON DELETE RESTRICT。';

comment on column public.restaurants.name is
  '店名；btrim 後 char_length 須為 1..100。';

comment on column public.restaurants.category is
  '分類 text（不另建 category table）；btrim 後 1..50。';

comment on column public.restaurants.phone is
  '電話；可 NULL。';

comment on column public.restaurants.address is
  '地址；可 NULL。';

comment on column public.restaurants.website_url is
  '官網或相關網址；可 NULL。';

comment on column public.restaurants.notes is
  '備註；可 NULL，最長 200 字元。';

comment on column public.restaurants.latitude is
  '緯度；可 NULL，範圍 -90..90。';

comment on column public.restaurants.longitude is
  '經度；可 NULL，範圍 -180..180。';

comment on column public.restaurants.price_min is
  '價位下限（整數）；可 NULL，且不得為負。';

comment on column public.restaurants.price_max is
  '價位上限（整數）；可 NULL；若與 price_min 皆有值則須 >= price_min。';

comment on column public.restaurants.google_place_id is
  'Google Place ID；NULL 表示手動新增。同一 group 內與 google_place_id 唯一。';

comment on column public.restaurants.business_hours is
  '營業時間 jsonb（時段、公休日等）；結構由應用層約定。';

comment on column public.restaurants.last_google_sync_at is
  '最近 Google 同步時間；手動資料可為 NULL。';

comment on column public.restaurants.created_at is
  '建立時間（UTC timestamptz）。';

comment on column public.restaurants.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


-- -----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE
-- -----------------------------------------------------------------------------

create trigger trg_restaurants_updated_at
  before update on public.restaurants
  for each row
  execute function public.handle_updated_at();
