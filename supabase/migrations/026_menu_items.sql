-- =============================================================================
-- Migration : 026_menu_items.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.menu_items（餐廳結構化菜單品項 Foundation）
--
-- 依賴：
--   • 001_base.sql       → public.handle_updated_at()
--   • 007_restaurants.sql → public.restaurants（restaurant_id FK）
--   • 016_enable_rls.sql  → public.can_access_restaurant(uuid)
--
-- 本檔範圍：
--   ✅ public.menu_items 資料表
--   ✅ FK：restaurant_id → restaurants(id) ON DELETE CASCADE
--   ✅ CHECK：category / name 非空白、display_order >= 1
--   ✅ Index：(restaurant_id, display_order)
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ✅ RLS + SELECT / INSERT / UPDATE / DELETE（經 can_access_restaurant）
--   ❌ description / image / ice_options / sugar_options / tags / availability
--   ❌ AI Import / OCR（本 Sprint 僅 Foundation）
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Table: public.menu_items
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--
--   • restaurant_id → public.restaurants(id) ON DELETE CASCADE
--       餐廳刪除時一併清除品項。
--
--   • category TEXT NOT NULL
--       菜單分類（如「純喝茶」）。無分類時應用層寫入「其他」。
--
--   • name TEXT NOT NULL
--       品項名稱；保持店家原文。
--
--   • price NUMERIC
--       價格（數字）；無法確認時為 NULL。
--
--   • display_order INT NOT NULL DEFAULT 1
--       菜單原本順序（1 起算）；不依價格／名稱排序。
--
--   • created_at / updated_at
--       updated_at 由 handle_updated_at trigger 維護。
-- -----------------------------------------------------------------------------

create table public.menu_items (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  category text not null
    constraint menu_items_category_length_check
      check (
        char_length(btrim(category)) between 1 and 50
      ),

  name text not null
    constraint menu_items_name_length_check
      check (
        char_length(btrim(name)) between 1 and 100
      ),

  price numeric
    constraint menu_items_price_non_negative_check
      check (price is null or price >= 0),

  display_order integer not null
    default 1
    constraint menu_items_display_order_positive_check
      check (display_order >= 1),

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.menu_items is
  '餐廳結構化菜單品項。一間餐廳可對應多筆品項（1:N）。不含 AI Import 流程。';

comment on column public.menu_items.id is
  '品項主鍵；預設 gen_random_uuid()。';

comment on column public.menu_items.restaurant_id is
  '所屬餐廳；FK → public.restaurants(id) ON DELETE CASCADE。';

comment on column public.menu_items.category is
  '菜單分類；btrim 後長度 1~50。無分類時應用層使用「其他」。';

comment on column public.menu_items.name is
  '品項名稱；btrim 後長度 1~100；保持店家原文。';

comment on column public.menu_items.price is
  '價格（numeric）；無法確認時為 NULL。';

comment on column public.menu_items.display_order is
  '顯示順序（1 起算）；對齊菜單原本順序。';

comment on column public.menu_items.created_at is
  '建立時間（UTC timestamptz）。';

comment on column public.menu_items.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


create index menu_items_restaurant_id_display_order_idx
  on public.menu_items (restaurant_id, display_order);


create trigger trg_menu_items_updated_at
  before update on public.menu_items
  for each row
  execute function public.handle_updated_at();


-- -----------------------------------------------------------------------------
-- RLS：群組成員可經 restaurant 存取（對齊 menu_photos）
-- -----------------------------------------------------------------------------

alter table public.menu_items enable row level security;

drop policy if exists "menu_items_select" on public.menu_items;
create policy "menu_items_select"
  on public.menu_items
  for select
  to authenticated
  using (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_items_insert" on public.menu_items;
create policy "menu_items_insert"
  on public.menu_items
  for insert
  to authenticated
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_items_update" on public.menu_items;
create policy "menu_items_update"
  on public.menu_items
  for update
  to authenticated
  using (public.can_access_restaurant(restaurant_id))
  with check (public.can_access_restaurant(restaurant_id));

drop policy if exists "menu_items_delete" on public.menu_items;
create policy "menu_items_delete"
  on public.menu_items
  for delete
  to authenticated
  using (public.can_access_restaurant(restaurant_id));
