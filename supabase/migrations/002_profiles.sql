-- =============================================================================
-- Migration : 002_profiles.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.profiles（使用者個人資料）
--
-- 依賴：
--   • 001_base.sql → public.handle_updated_at()
--   • auth.users（Supabase Auth 內建）
--
-- 本檔範圍：
--   ✅ public.profiles 資料表
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ❌ RLS / Policy
--   ❌ Index（之後依查詢需求再加）
--   ❌ Auth Trigger（之後再接 handle_new_user 等）
--   ❌ current_group_id → groups FK（groups 尚未建立）
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.profiles
--
-- 設計說明：
--
--   • id UUID PK + FK → auth.users(id) ON DELETE CASCADE
--       1:1 對應 Auth 使用者。使用者刪除時一併清除 profile，避免孤兒列。
--
--   • display_name TEXT NOT NULL
--       CHECK：btrim 後長度須為 1~50（以字元 char_length 計算，支援中文）。
--       不在此自動 trim 寫回；驗證契約清楚，寫入端負責傳入合理字串。
--
--   • avatar_url TEXT NULL
--       頭像 URL，可晚點再補 storage path / CDN URL 格式約束。
--
--   • current_group_id UUID NULL
--       目前選取的群組。暫不建 FK，待 00x_groups.sql 再補 references。
--
--   • created_at / updated_at TIMESTAMPTZ
--       default timezone('utc', now())，與 001_base 慣例一致。
--       updated_at 由 BEFORE UPDATE trigger 自動覆寫。
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key
    references auth.users (id) on delete cascade,

  display_name text not null
    constraint profiles_display_name_length_check
      check (
        char_length(btrim(display_name)) between 1 and 50
      ),

  avatar_url text,

  current_group_id uuid,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.profiles is
  'App user profile (1:1 with auth.users). current_group_id FK deferred until groups exists.';

comment on column public.profiles.id is
  'Same UUID as auth.users.id; cascade delete with auth user.';

comment on column public.profiles.display_name is
  'Required display name; after btrim, char_length must be 1..50.';

comment on column public.profiles.avatar_url is
  'Optional avatar URL or storage path.';

comment on column public.profiles.current_group_id is
  'Currently selected group; FK to groups intentionally deferred.';

comment on column public.profiles.created_at is
  'Row creation time (UTC timestamptz).';

comment on column public.profiles.updated_at is
  'Last update time (UTC timestamptz); maintained by handle_updated_at trigger.';


-- -----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE
--
-- 使用 001_base 的 shared function，不在此重複實作時間戳邏輯。
-- -----------------------------------------------------------------------------

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
