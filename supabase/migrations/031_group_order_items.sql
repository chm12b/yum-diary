-- =============================================================================
-- Migration : 031_group_order_items.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.group_order_items（Participant 個人點餐品項 Foundation）
--
-- 依賴：
--   • 001_base.sql                    → public.handle_updated_at()
--   • 026_menu_items.sql               → public.menu_items（menu_item_id FK）
--   • 029_group_order_participants.sql → public.group_order_participants
--                                       public.can_access_group_order(uuid)
--
-- 本檔範圍：
--   ✅ public.is_own_group_order_participant(uuid) helper
--   ✅ public.can_access_group_order_participant(uuid) helper
--   ✅ public.group_order_items 資料表
--   ✅ FK：participant_id / menu_item_id
--   ✅ quantity default 1；note nullable
--   ✅ BEFORE UPDATE trigger → public.handle_updated_at()
--   ✅ RLS：群組成員可讀；Participant 僅能 CRUD 自己的訂單
--   ❌ 糖度 / 冰塊 / 加料 / summary / history
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Helper: public.is_own_group_order_participant(p_participant_id)
--
--   判斷目前登入者是否為該 participant 列的本人。
-- -----------------------------------------------------------------------------

create or replace function public.is_own_group_order_participant(
  p_participant_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_order_participants p
    where p.id = p_participant_id
      and p.user_id = auth.uid()
  );
$$;

comment on function public.is_own_group_order_participant(uuid) is
  '目前登入者是否為指定 group_order_participants 列的本人。SECURITY DEFINER。';


-- -----------------------------------------------------------------------------
-- Helper: public.can_access_group_order_participant(p_participant_id)
--
--   判斷目前登入者能否存取該 participant 所屬的揪團點餐。
-- -----------------------------------------------------------------------------

create or replace function public.can_access_group_order_participant(
  p_participant_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_order_participants p
    join public.group_orders go
      on go.id = p.group_order_id
    join public.group_members gm
      on gm.group_id = go.group_id
    where p.id = p_participant_id
      and gm.profile_id = auth.uid()
  );
$$;

comment on function public.can_access_group_order_participant(uuid) is
  '目前登入者能否存取指定 participant 所屬揪團點餐。SECURITY DEFINER。';

revoke all on function public.is_own_group_order_participant(uuid) from public;
revoke all on function public.can_access_group_order_participant(uuid) from public;
grant execute on function public.is_own_group_order_participant(uuid) to authenticated;
grant execute on function public.can_access_group_order_participant(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- Table: public.group_order_items
--
-- 設計說明：
--
--   • id UUID PK DEFAULT gen_random_uuid()
--
--   • participant_id → public.group_order_participants(id) ON DELETE CASCADE
--       參與者刪除時一併清除其點餐品項。
--
--   • menu_item_id → public.menu_items(id) ON DELETE RESTRICT
--       菜單品項被刪除前需先清除相關訂單列。
--
--   • quantity INT NOT NULL DEFAULT 1
--
--   • note TEXT NULL
--       選填備註（本版不含糖度／冰塊／加料）。
--
--   • created_at / updated_at
--       updated_at 由 handle_updated_at trigger 維護。
-- -----------------------------------------------------------------------------

create table public.group_order_items (
  id uuid primary key
    default gen_random_uuid(),

  participant_id uuid not null
    references public.group_order_participants (id) on delete cascade,

  menu_item_id uuid not null
    references public.menu_items (id) on delete restrict,

  quantity integer not null
    default 1
    constraint group_order_items_quantity_positive_check
      check (quantity >= 1),

  note text
    constraint group_order_items_note_length_check
      check (
        note is null
        or char_length(btrim(note)) between 1 and 200
      ),

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

comment on table public.group_order_items is
  'Participant 個人點餐品項。不含糖度／冰塊／加料選項。';

comment on column public.group_order_items.id is
  '訂單品項主鍵；預設 gen_random_uuid()。';

comment on column public.group_order_items.participant_id is
  '所屬參與者；FK → public.group_order_participants(id) ON DELETE CASCADE。';

comment on column public.group_order_items.menu_item_id is
  '對應菜單品項；FK → public.menu_items(id) ON DELETE RESTRICT。';

comment on column public.group_order_items.quantity is
  '數量；預設 1，且必須 >= 1。';

comment on column public.group_order_items.note is
  '選填備註；非 NULL 時 btrim 後長度 1~200。';

comment on column public.group_order_items.created_at is
  '建立時間（UTC timestamptz）。';

comment on column public.group_order_items.updated_at is
  '最後更新時間（UTC timestamptz）；由 handle_updated_at trigger 維護。';


create index group_order_items_participant_id_created_at_idx
  on public.group_order_items (participant_id, created_at);

create index group_order_items_menu_item_id_idx
  on public.group_order_items (menu_item_id);


create trigger trg_group_order_items_updated_at
  before update on public.group_order_items
  for each row
  execute function public.handle_updated_at();


-- -----------------------------------------------------------------------------
-- RLS
--   • SELECT：群組成員（經 participant → group_order）
--   • INSERT / UPDATE / DELETE：僅本人 participant
-- -----------------------------------------------------------------------------

alter table public.group_order_items enable row level security;

drop policy if exists "group_order_items_select" on public.group_order_items;
create policy "group_order_items_select"
  on public.group_order_items
  for select
  to authenticated
  using (public.can_access_group_order_participant(participant_id));

drop policy if exists "group_order_items_insert" on public.group_order_items;
create policy "group_order_items_insert"
  on public.group_order_items
  for insert
  to authenticated
  with check (public.is_own_group_order_participant(participant_id));

drop policy if exists "group_order_items_update" on public.group_order_items;
create policy "group_order_items_update"
  on public.group_order_items
  for update
  to authenticated
  using (public.is_own_group_order_participant(participant_id))
  with check (public.is_own_group_order_participant(participant_id));

drop policy if exists "group_order_items_delete" on public.group_order_items;
create policy "group_order_items_delete"
  on public.group_order_items
  for delete
  to authenticated
  using (public.is_own_group_order_participant(participant_id));
