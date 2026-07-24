-- =============================================================================
-- Migration : 033_group_order_completed_at.sql
-- Project   : Yum Diary
-- Purpose   : 為 public.group_orders 新增 completed_at（完成訂單時間）
--
-- 依賴：
--   • 027_group_orders.sql → public.group_orders
--
-- 本檔範圍：
--   ✅ completed_at timestamptz NULL
--   ❌ 不變更 status enum / RLS
-- =============================================================================

alter table public.group_orders
  add column if not exists completed_at timestamptz;

comment on column public.group_orders.completed_at is
  '完成時間（UTC timestamptz）；status 改為 COMPLETED 時寫入。';
