-- =============================================================================
-- Migration : 024_restaurant_favorites.sql
-- Project   : Yum Diary
-- Purpose   : 建立個人餐廳收藏與本人限定 RLS
-- =============================================================================

create table public.restaurant_favorites (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,

  user_id uuid not null
    references auth.users (id) on delete cascade,

  created_at timestamptz not null
    default timezone('utc', now()),

  constraint restaurant_favorites_restaurant_id_user_id_key
    unique (restaurant_id, user_id)
);

comment on table public.restaurant_favorites is
  '使用者個人的餐廳收藏；餐廳仍屬群組共享資料。';

create index restaurant_favorites_user_id_created_at_idx
  on public.restaurant_favorites (user_id, created_at desc);

alter table public.restaurant_favorites enable row level security;

create policy "restaurant_favorites_select"
  on public.restaurant_favorites
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.can_access_restaurant(restaurant_id)
  );

create policy "restaurant_favorites_insert"
  on public.restaurant_favorites
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_restaurant(restaurant_id)
  );

create policy "restaurant_favorites_update"
  on public.restaurant_favorites
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.can_access_restaurant(restaurant_id)
  );

create policy "restaurant_favorites_delete"
  on public.restaurant_favorites
  for delete
  to authenticated
  using (user_id = auth.uid());
