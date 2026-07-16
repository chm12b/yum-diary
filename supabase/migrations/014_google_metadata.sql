-- ============================================================================
-- Migration: 014_google_metadata.sql
-- Purpose: Store Google Places rating / rating count / price level on restaurants.
-- ============================================================================

alter table public.restaurants
  add column if not exists google_rating numeric(2, 1);

alter table public.restaurants
  add column if not exists google_rating_count integer;

alter table public.restaurants
  add column if not exists price_level smallint;

alter table public.restaurants
  drop constraint if exists restaurants_google_rating_range_check;
alter table public.restaurants
  add constraint restaurants_google_rating_range_check
  check (
    google_rating is null
    or google_rating between 0 and 5
  );

alter table public.restaurants
  drop constraint if exists restaurants_google_rating_count_nonnegative_check;
alter table public.restaurants
  add constraint restaurants_google_rating_count_nonnegative_check
  check (
    google_rating_count is null
    or google_rating_count >= 0
  );

alter table public.restaurants
  drop constraint if exists restaurants_price_level_range_check;
alter table public.restaurants
  add constraint restaurants_price_level_range_check
  check (
    price_level is null
    or price_level between 0 and 4
  );

comment on column public.restaurants.google_rating is
  'Google 評分（0.0–5.0）；可 NULL。';

comment on column public.restaurants.google_rating_count is
  'Google 評分則數；可 NULL、不得為負。';

comment on column public.restaurants.price_level is
  'Google 價格等級（0–4，對應 $ – $$$$$）；可 NULL。';
