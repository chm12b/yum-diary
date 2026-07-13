-- =============================================================================
-- Migration : 001_base.sql
-- Project   : Yum Diary
-- Purpose   : 所有資料表共用的基礎資料庫 primitive
--
-- 本檔範圍（刻意最小化）：
--   ✅ 建立 public.handle_updated_at() trigger function
--   ❌ 不建立任何 table
--   ❌ 不建立任何 trigger（之後每張表各自掛載）
--   ❌ 不建立任何 RLS policy
--
-- 為什麼要有獨立的 base migration？
--   1. 重用（Reuse）
--      之後多張表都會有 updated_at，共用同一支 function，避免重複貼上相同邏輯。
--   2. 順序（Ordering）
--      先定義 function，後續 table migration 才能安全地：
--      BEFORE UPDATE … EXECUTE FUNCTION public.handle_updated_at()
--   3. 可審閱（Reviewability）
--      schema 基礎建設與 domain DDL 分開，PR / review 更清楚。
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Function: public.handle_updated_at()
--
-- 用途：
--   通用的 BEFORE UPDATE row-level trigger function。
--   在 UPDATE 寫入前，把 NEW.updated_at 設為當下 UTC 時間，再回傳 NEW。
--
-- 設計說明（為何這樣寫）：
--
--   1) RETURNS TRIGGER
--      PostgreSQL row-level BEFORE UPDATE trigger 必須回傳 TRIGGER 型別，
--      並回傳 NEW（或 NULL 取消此次 UPDATE）。
--
--   2) LANGUAGE plpgsql
--      需要對 NEW 賦值並 return，PL/pgSQL 是標準做法。
--
--   3) SECURITY INVOKER（明確宣告）
--      此函式只改動「正在更新中的 NEW row」，不需讀寫其他表、也不需提權。
--      因此不用 SECURITY DEFINER，減少攻擊面。
--
--   4) SET search_path = ''
--      Supabase / PostgreSQL 安全最佳實務：鎖死 search_path，
--      避免惡意物件透過 search_path hijacking 劫持未限定 schema 的名稱。
--      now() / timezone() 仍可透過 pg_catalog 正常使用。
--
--   5) timezone('utc', now())
--      寫入絕對 UTC 時間點。欄位請使用 timestamptz（Supabase 慣例），
--      讓前端依使用者時區顯示，避免 timestamp without time zone 的歧義。
--
--   6) 欄位契約（Column contract）
--      目標資料表必須有名為 updated_at 的欄位，建議：
--        updated_at timestamptz not null default timezone('utc', now())
--
-- 之後 table migration 的掛載方式（本檔不要建立 trigger）：
--
--   create trigger handle_updated_at
--     before update on public.<table_name>
--     for each row
--     execute function public.handle_updated_at();
--
-- 備註：
--   • 一個 shared function + 每表一個 trigger，優於每張表複製一份 PL/pgSQL。
--   • Supabase 也可用 extensions.moddatetime；本專案選擇自管 PL/pgSQL，
--     零 extension 依賴、命名一致、行為可預期。
-- -----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- 每次 UPDATE 都覆寫 updated_at，確保時間戳由資料庫單一來源產生，
  -- 不受 client 傳入的舊值／偽造值影響。
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

comment on function public.handle_updated_at() is
  'BEFORE UPDATE trigger helper: sets NEW.updated_at to timezone(''utc'', now()). '
  'Attach per table with EXECUTE FUNCTION public.handle_updated_at(). '
  'Requires a timestamptz column named updated_at.';


-- -----------------------------------------------------------------------------
-- Grants
--
-- 為什麼要授權？
--   PostgreSQL 在觸發 trigger 時，執行者必須對 trigger function 有 EXECUTE。
--   客戶端（anon / authenticated）或 service_role 若會 UPDATE 資料列，
--   就需要能執行此函式，updated_at 才會自動更新。
--
-- 為什麼 revoke public？
--   採最小權限：先從 PUBLIC 收回，再只授給 Supabase 常用角色。
-- -----------------------------------------------------------------------------

revoke all on function public.handle_updated_at() from public;

grant execute on function public.handle_updated_at()
  to anon, authenticated, service_role;
