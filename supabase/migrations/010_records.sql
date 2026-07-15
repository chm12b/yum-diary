-- =============================================================================
-- Migration : 010_records.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.records（個人用餐紀錄／美食日記）
--
-- 依賴：
--   • 001_base.sql     → public.handle_updated_at()
--   • 002_profiles.sql → public.profiles（user_id FK）
--   • 007_restaurants.sql → public.restaurants（restaurant_id FK）
--
-- 本檔範圍：
--   ✅ public.records 資料表
--   ✅ FK：restaurant_id → restaurants、user_id → profiles
--   ✅ CHECK：評分 1~5、心得長度
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ✅ Index：（restaurant_id, user_id, visit_date DESC）
--   ❌ 點餐內容／照片（後續階段）
--   ❌ RLS / Policy
--
-- 設計重點：
--   • 用餐紀錄屬個人可見（user_id），餐廳仍屬群組主檔
--   • 第一階段僅：用餐日期、評分、心得
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.records
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--
--   • restaurant_id → public.restaurants(id) ON DELETE CASCADE
--       餐廳刪除時一併清除用餐紀錄。
--
--   • user_id → public.profiles(id) ON DELETE CASCADE
--       個人日記；profile 刪除時一併清除。
--
--   • visit_date DATE NOT NULL
--       用餐日期（不含時間）。
--
--   • rating INTEGER NOT NULL
--       CHECK：1~5。
--
--   • notes TEXT NOT NULL
--       心得；CHECK：btrim 後長度 1~200（對齊新增表單）。
--
--   • created_at / updated_at
--       default timezone('utc', now())；updated_at 由 trigger 維護。
-- -----------------------------------------------------------------------------

create table public.records (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  visit_date date not null,

  rating integer not null
    constraint records_rating_range_check
      check (rating between 1 and 5),

  notes text not null
    constraint records_notes_length_check
      check (
        char_length(btrim(notes)) between 1 and 200
      ),

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.records is
  '個人用餐紀錄（美食日記）；屬 user，關聯群組內餐廳。';

comment on column public.records.restaurant_id is
  '所屬餐廳；餐廳刪除時 cascade。';

comment on column public.records.user_id is
  '紀錄擁有者；僅本人可見（應用層／後續 RLS）。';

comment on column public.records.visit_date is
  '用餐日期（date，不含時間）。';

comment on column public.records.rating is
  '評分 1~5。';

comment on column public.records.notes is
  '心得文字；1~200 字元（trim 後）。';


create index records_restaurant_user_visit_idx
  on public.records (restaurant_id, user_id, visit_date desc);


create trigger trg_records_updated_at
  before update on public.records
  for each row
  execute function public.handle_updated_at();
