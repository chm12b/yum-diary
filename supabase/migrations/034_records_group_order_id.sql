-- =============================================================================
-- Migration : 034_records_group_order_id.sql
-- Project   : Yum Diary
-- Purpose   : records 新增 group_order_id（共同點餐 → 美食日記關聯）
--
-- 依賴：
--   • 010_records.sql       → public.records
--   • 027_group_orders.sql  → public.group_orders
--
-- 本檔範圍：
--   ✅ records.group_order_id UUID NULL
--   ✅ FK → group_orders(id) ON DELETE SET NULL
--   ✅ Index：group_order_id
--   ✅ Unique：(group_order_id, user_id) WHERE group_order_id IS NOT NULL
--              （同一使用者對同一共同點餐僅能建立一筆美食日記）
--   ❌ 不變更 RLS / 其他欄位
-- =============================================================================

alter table public.records
  add column if not exists group_order_id uuid
    references public.group_orders (id) on delete set null;

comment on column public.records.group_order_id is
  '來源共同點餐；可 NULL（手動新增日記）。共同點餐刪除時設為 NULL。';

create index if not exists records_group_order_id_idx
  on public.records (group_order_id);

-- One dining record per user per group order (when linked).
create unique index if not exists records_group_order_id_user_id_key
  on public.records (group_order_id, user_id)
  where group_order_id is not null;
