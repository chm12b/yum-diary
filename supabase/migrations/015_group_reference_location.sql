-- ============================================================================
-- Migration: 015_group_reference_location.sql
-- Purpose: Group-owned reference location, the single source for distance calc.
-- ============================================================================

alter table public.groups
  add column if not exists reference_name text not null default '家';

alter table public.groups
  add column if not exists reference_lat double precision not null
    default 23.094426;

alter table public.groups
  add column if not exists reference_lng double precision not null
    default 120.234596;

alter table public.groups
  drop constraint if exists groups_reference_name_length_check;
alter table public.groups
  add constraint groups_reference_name_length_check
  check (char_length(btrim(reference_name)) between 1 and 50);

alter table public.groups
  drop constraint if exists groups_reference_lat_range_check;
alter table public.groups
  add constraint groups_reference_lat_range_check
  check (reference_lat between -90 and 90);

alter table public.groups
  drop constraint if exists groups_reference_lng_range_check;
alter table public.groups
  add constraint groups_reference_lng_range_check
  check (reference_lng between -180 and 180);

comment on column public.groups.reference_name is
  '距離計算的參考點名稱（例如「家」）；NOT NULL，預設 家。';

comment on column public.groups.reference_lat is
  '參考點緯度；NOT NULL，預設 23.094426。';

comment on column public.groups.reference_lng is
  '參考點經度；NOT NULL，預設 120.234596。';
