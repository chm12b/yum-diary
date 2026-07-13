-- =============================================================================
-- Migration : 005_group_members.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.group_members（群組成員）
--
-- 依賴：
--   • 001_base.sql     → public.handle_updated_at()
--   • 002_profiles.sql → public.profiles
--   • 004_groups.sql   → public.groups
--
-- 本檔範圍：
--   ✅ public.group_members 資料表
--   ✅ role CHECK（owner / admin / member）
--   ✅ UNIQUE(group_id, profile_id)
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ❌ RLS / Policy
--   ❌ 其他額外 Index（UNIQUE 約束除外）
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.group_members
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--       獨立成員列主鍵，方便之後引用（例如權限稽核、邀請紀錄）。
--
--   • group_id → public.groups(id) ON DELETE CASCADE
--       群組刪除時一併清除成員列，避免孤兒關聯。
--
--   • profile_id → public.profiles(id) ON DELETE CASCADE
--       使用者／profile 刪除時退出所有群組。
--
--   • role TEXT NOT NULL + CHECK
--       僅允許 owner / admin / member，以 CHECK 約束在 DB 層強制。
--       （之後若角色變多，可再遷移為 enum 或 lookup table。）
--
--   • UNIQUE(group_id, profile_id)
--       同一使用者在同一群組只能有一筆成員紀錄。
--
--   • joined_at
--       加入時間；預設 UTC now，可與 created_at 相同，
--       但語意上保留「加入群組」事件時間。
--
--   • created_at / updated_at
--       與既有表一致；updated_at 由 trigger 維護（例如改 role）。
-- -----------------------------------------------------------------------------

create table public.group_members (
  id uuid primary key
    default gen_random_uuid(),

  group_id uuid not null
    references public.groups (id) on delete cascade,

  profile_id uuid not null
    references public.profiles (id) on delete cascade,

  role text not null
    constraint group_members_role_check
      check (role in ('owner', 'admin', 'member')),

  joined_at timestamptz not null
    default timezone('utc', now()),

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint group_members_group_id_profile_id_key
    unique (group_id, profile_id)
);

comment on table public.group_members is
  '群組成員關聯表。同一 profile 在同一 group 僅能一筆；role 限 owner/admin/member。';

comment on column public.group_members.id is
  '成員列主鍵；預設 gen_random_uuid()。';

comment on column public.group_members.group_id is
  '所屬群組；FK → public.groups(id) ON DELETE CASCADE。';

comment on column public.group_members.profile_id is
  '成員 profile；FK → public.profiles(id) ON DELETE CASCADE。';

comment on column public.group_members.role is
  '成員角色；僅允許 owner、admin、member。';

comment on column public.group_members.joined_at is
  '加入群組時間（UTC timestamptz）。';

comment on column public.group_members.created_at is
  '列建立時間（UTC timestamptz）。';

comment on column public.group_members.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


-- -----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE
-- -----------------------------------------------------------------------------

create trigger trg_group_members_updated_at
  before update on public.group_members
  for each row
  execute function public.handle_updated_at();
