-- =============================================================================
-- Migration : 025_group_reference_location_nullable.sql
-- Project   : Yum Diary
-- Purpose   : 允許群組預設位置欄位為 NULL（清除後可表示「尚未設定」）
--
-- 依賴：
--   • 015_group_reference_location.sql → reference_name / lat / lng
--
-- 本檔範圍：
--   ✅ 三欄改為可 NULL
--   ✅ 移除預設值（新建群組預設為未設定）
--   ✅ 調整 name 長度 CHECK 以允許 NULL
--   ❌ 不改 RLS
-- =============================================================================

alter table public.groups
  alter column reference_name drop not null,
  alter column reference_name drop default;

alter table public.groups
  alter column reference_lat drop not null,
  alter column reference_lat drop default;

alter table public.groups
  alter column reference_lng drop not null,
  alter column reference_lng drop default;

alter table public.groups
  drop constraint if exists groups_reference_name_length_check;

alter table public.groups
  add constraint groups_reference_name_length_check
  check (
    reference_name is null
    or char_length(btrim(reference_name)) between 1 and 50
  );

comment on column public.groups.reference_name is
  '距離計算的參考點名稱（例如「家」）；NULL 表示尚未設定。';

comment on column public.groups.reference_lat is
  '參考點緯度；NULL 表示尚未設定。';

comment on column public.groups.reference_lng is
  '參考點經度；NULL 表示尚未設定。';
