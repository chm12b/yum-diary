-- =============================================================================
-- Migration : 019_record_foods.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.record_foods（用餐紀錄點餐內容）
--
-- 依賴：
--   • 010_records.sql  → public.records（record_id FK）
--   • 002_profiles.sql → public.profiles（created_by FK）
--
-- 本檔範圍：
--   ✅ public.record_foods 資料表
--   ✅ FK：record_id → records(id) ON DELETE CASCADE
--   ✅ FK：created_by → profiles(id) ON DELETE SET NULL
--   ✅ CHECK：name 非空白、display_order >= 1
--   ✅ Index：(record_id, display_order)
--   ❌ updated_at / handle_updated_at
--   ❌ RLS / Policy
-- =============================================================================


create table public.record_foods (
  id uuid primary key
    default gen_random_uuid(),

  record_id uuid not null
    references public.records (id) on delete cascade,

  name text not null
    constraint record_foods_name_length_check
      check (
        char_length(btrim(name)) between 1 and 50
      ),

  display_order integer not null
    default 1
    constraint record_foods_display_order_positive_check
      check (display_order >= 1),

  created_by uuid
    references public.profiles (id) on delete set null,

  created_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.record_foods is
  '用餐紀錄點餐內容。一筆 record 可對應多筆品項（1:N）。';

comment on column public.record_foods.id is
  '點餐品項主鍵；預設 gen_random_uuid()。';

comment on column public.record_foods.record_id is
  '所屬用餐紀錄；FK → public.records(id) ON DELETE CASCADE。';

comment on column public.record_foods.name is
  '品項名稱；btrim 後長度 1~50。';

comment on column public.record_foods.display_order is
  '顯示順序（1 起算）；預設 1。';

comment on column public.record_foods.created_by is
  '新增者；FK → public.profiles(id) ON DELETE SET NULL；可為 NULL。';

comment on column public.record_foods.created_at is
  '建立時間（UTC timestamptz）。';


create index record_foods_record_id_display_order_idx
  on public.record_foods (record_id, display_order);
