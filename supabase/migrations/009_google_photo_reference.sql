-- ============================================================================
-- Migration: 009_google_photo_reference.sql
-- Purpose: Store Google Places photo resource name on restaurants for sync.
-- ============================================================================

alter table public.restaurants
  add column if not exists google_photo_reference text;

alter table public.restaurants
  drop constraint if exists restaurants_google_photo_reference_length_check;

alter table public.restaurants
  add constraint restaurants_google_photo_reference_length_check
  check (
    google_photo_reference is null
    or char_length(btrim(google_photo_reference)) between 1 and 2048
  );

comment on column public.restaurants.google_photo_reference is
  'Google Places photo resource name（預覽用 reference，非 Storage path）；可 NULL。';
