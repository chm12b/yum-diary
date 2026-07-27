-- =============================================================================
-- Migration : 035_restaurant_archived_at.sql
-- Project   : Yum Diary
-- Purpose   : restaurants 新增 archived_at（Restaurant Archive v1）
--
-- 依賴：
--   • 007_restaurants.sql → public.restaurants
--
-- 本檔範圍：
--   ✅ restaurants.archived_at timestamptz NULL
--   ✅ Index：archived_at
--   ❌ 永久刪除 / 封存列表 / 取消封存（後續）
--   ❌ RLS（既有 restaurants policy 涵蓋新欄位）
--
-- 說明：
--   • NULL = 一般列表可見
--   • 有值 = 已封存；不出現在一般列表，歷史入口仍可開啟 Detail
--   • 冪等：IF NOT EXISTS，可重跑
-- =============================================================================

alter table public.restaurants
  add column if not exists archived_at timestamptz;

comment on column public.restaurants.archived_at is
  '封存時間；NULL = 未封存（一般列表可見）。有值時從一般列表隱藏，歷史資料保留。';

create index if not exists restaurants_archived_at_idx
  on public.restaurants (archived_at);
