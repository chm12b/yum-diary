-- =============================================================================
-- Migration : 028_restaurant_city_district.sql
-- Project   : Yum Diary
-- Purpose   : restaurants 新增 city / district（Restaurant Filter Phase 1）
--
-- 依賴：
--   • 007_restaurants.sql → public.restaurants
--
-- 本檔範圍：
--   ✅ restaurants.city TEXT NULL
--   ✅ restaurants.district TEXT NULL
--   ❌ Address Parser / Backfill / Filter UI / Query（後續 Phase）
--   ❌ RLS（既有 restaurants policy 涵蓋新欄位）
--
-- 說明：
--   • 規格文件曾標為 015_restaurant_city_district.sql，但 015 已用於
--     group_reference_location；本專案依序使用 028。
--   • 冪等：IF NOT EXISTS，可重跑。
-- =============================================================================

alter table public.restaurants
  add column if not exists city text;

alter table public.restaurants
  add column if not exists district text;

comment on column public.restaurants.city is
  '城市（例如：嘉義市）；由地址解析寫入；可 NULL（尚未解析或無法判斷）。';

comment on column public.restaurants.district is
  '行政區（例如：東區）；由地址解析寫入；可 NULL（尚未解析或無法判斷）。';
