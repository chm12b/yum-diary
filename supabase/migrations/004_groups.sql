-- =============================================================================
-- Migration : 004_groups.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.groups（群組）
--
-- 依賴：
--   • 001_base.sql     → public.handle_updated_at()
--   • 002_profiles.sql → public.profiles（owner_id FK）
--
-- 本檔範圍：
--   ✅ public.groups 資料表
--   ✅ invite_code UNIQUE（唯一約束，隨之建立 unique index）
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ❌ group_members
--   ❌ RLS / Policy
--   ❌ 其他額外 Index
--   ❌ Seed Data
--
-- 後續可補：
--   • profiles.current_group_id → groups(id) FK
--   • group_members 成員表與 RLS
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.groups
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--       Supabase / PostgreSQL 慣例，由資料庫產生主鍵，避免 client 自行帶入衝突。
--
--   • name TEXT NOT NULL
--       CHECK：btrim 後 char_length 須為 1~100（支援中文）。
--
--   • invite_code TEXT NOT NULL UNIQUE
--       邀請碼全域唯一。UNIQUE 約束會自動建立 unique index；
--       本檔不另外手動建立其他 index。
--
--   • owner_id UUID NOT NULL → public.profiles(id) ON DELETE RESTRICT
--       群組必須有擁有者；擁有者尚有群組時不可刪除 profile（RESTRICT）。
--
--   • is_archived BOOLEAN NOT NULL DEFAULT FALSE
--       軟封存標記，預設未封存。
--
--   • created_at / updated_at TIMESTAMPTZ
--       default timezone('utc', now())，與 001_base / 002_profiles 一致。
--       updated_at 由 BEFORE UPDATE trigger 自動覆寫。
-- -----------------------------------------------------------------------------

create table public.groups (
  id uuid primary key
    default gen_random_uuid(),

  name text not null
    constraint groups_name_length_check
      check (
        char_length(btrim(name)) between 1 and 100
      ),

  invite_code text not null
  constraint groups_invite_code_key unique
  constraint groups_invite_code_format_check
    check (
      invite_code ~ '^[A-Z0-9]{6}$'
    ),
    
  owner_id uuid not null
    references public.profiles (id) on delete restrict,

  is_archived boolean not null
    default false,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.groups is
  '使用者群組。邀請碼唯一；擁有者為 profiles。成員關係見後續 group_members。';

comment on column public.groups.id is
  '群組主鍵；預設 gen_random_uuid()。';

comment on column public.groups.name is
  '群組名稱；btrim 後 char_length 須為 1..100。';

comment on column public.groups.invite_code is
  '邀請碼；NOT NULL 且 UNIQUE。';

comment on column public.groups.owner_id is
  '群組擁有者；FK → public.profiles(id) ON DELETE RESTRICT。';

comment on column public.groups.is_archived is
  '是否已封存；預設 false。';

comment on column public.groups.created_at is
  '建立時間（UTC timestamptz）。';

comment on column public.groups.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


-- -----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE
-- -----------------------------------------------------------------------------

create trigger trg_groups_updated_at
  before update on public.groups
  for each row
  execute function public.handle_updated_at();
