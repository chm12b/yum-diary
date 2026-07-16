-- =============================================================================
-- Migration : 017_restaurant_cover_path.sql
-- Project   : Yum Diary
-- Purpose   : 為 restaurants 新增封面圖 Storage path 欄位（Cover Photo MVP）
--
-- 依賴：
--   • 007_restaurants.sql → public.restaurants
--   • 011_storage.sql     → yum-diary bucket（cover.webp 路徑約定）
--
-- 本檔範圍：
--   ✅ restaurants.restaurant_cover_path TEXT NULL
--   ❌ 不建立新 table
--   ❌ 不改 Storage path 約定（沿用 restaurants/{id}/cover.webp）
--   ❌ RLS（見 016_enable_rls.sql；既有 restaurants policy 涵蓋本欄位）
--
-- 冪等：IF NOT EXISTS，可重跑。
-- =============================================================================

alter table public.restaurants
  add column if not exists restaurant_cover_path text;

comment on column public.restaurants.restaurant_cover_path is
  '封面圖在 yum-diary bucket 的 object key（例：restaurants/{id}/cover.webp）；NULL = 尚無封面。';
