-- =============================================================================
-- Migration : 006_create_group_rpc.sql
-- Project   : Yum Diary
-- Purpose   : 建立 public.create_group() RPC（建立群組的原子交易）
--
-- 依賴：
--   • 002_profiles.sql      → public.profiles（更新 current_group_id）
--   • 004_groups.sql        → public.groups
--   • 005_group_members.sql → public.group_members
--   • auth.uid()（Supabase Auth JWT）
--
-- 本檔範圍：
--   ✅ public.create_group(p_group_name, p_invite_code) → uuid
--   ✅ 基本輸入驗證（較清楚的錯誤訊息；不取代 table CHECK / UNIQUE）
--   ✅ GRANT EXECUTE → authenticated
--   ❌ 不建立 table / trigger
--   ❌ 不建立 RLS policy
--   ❌ 不改動既有表結構
--
-- 流程（單一 Transaction）：
--   1. 以 auth.uid() 取得目前登入者（禁止前端傳 user_id）
--   2. 驗證 p_group_name / p_invite_code
--   3. INSERT public.groups
--   4. INSERT public.group_members（role = owner）
--   5. UPDATE public.profiles.current_group_id
--   6. RETURN 新群組 id
--
-- 設計原因（為何用 RPC，而非三次 API）：
--   1. 原子性（Atomicity）
--      任一步失敗則整段 rollback，避免「有群組無成員」或
--      「有成員但 current_group_id 未更新」的半成品狀態。
--   2. 身分可信（Trusted identity）
--      owner_id / profile_id 一律來自 auth.uid()，前端無法冒充他人。
--   3. 可作為後續 RPC 範本
--      join_group / leave_group / switch_current_group 應沿用：
--      p_ 參數前綴、SECURITY INVOKER、search_path、驗證、COMMENT、中文註解。
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Function: public.create_group(p_group_name, p_invite_code)
--
-- 用途：
--   登入使用者建立新群組，並在同一交易內完成 owner 成員與目前群組切換。
--
-- 參數：
--   • p_group_name  text  群組名稱（對應 groups.name）
--   • p_invite_code text  邀請碼（對應 groups.invite_code，須為 6 碼大寫英數字）
--
-- 回傳：
--   uuid — 新建立的 groups.id（成功才回傳；失敗 raise，整段 rollback）
--
-- 設計說明（為何這樣寫）：
--
--   1) Parameter 使用 p_ 前綴
--      避免與 column name（name / invite_code）在 SQL 中混淆，提升可讀性。
--
--   2) RETURNS uuid（非 boolean）
--      呼叫端可立刻拿 group id 做導頁或後續查詢，無需再猜「剛建的是哪一筆」。
--
--   3) LANGUAGE plpgsql
--      需要多步驟、變數、條件驗證與明確 raise；PL/pgSQL 是標準做法。
--
--   4) SECURITY INVOKER（明確宣告，不使用 DEFINER）
--      以呼叫者權限執行，搭配之後 RLS。不提權，減少攻擊面。
--      auth.uid() 仍可從 JWT 正確取得目前使用者。
--
--   5) SET search_path = ''
--      鎖定 search_path，函式內一律 schema-qualified（public.* / auth.*），
--      避免 search_path hijacking。
--
--   6) 函式本體即單一 transaction
--      PostgreSQL 不允許在 function 內自行 COMMIT / ROLLBACK；
--      任一步失敗會 abort 整個呼叫，達到與 BEGIN…COMMIT 相同的原子性。
--
--   7) 驗證層 vs Constraint 層
--      函式開頭的 validation 提供較清楚的錯誤訊息；
--      table 上的 CHECK / UNIQUE / FK 仍是最終防線，不可省略。
-- -----------------------------------------------------------------------------

create or replace function public.create_group(
  p_group_name text,
  p_invite_code text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  -- 目前登入者；只信任 JWT，不接受參數傳入的 user_id
  v_user_id uuid := auth.uid();
  -- 新群組主鍵；成功後回傳給呼叫端
  v_group_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1) 必須已登入
  -- ---------------------------------------------------------------------------
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- ---------------------------------------------------------------------------
  -- 2) 基本輸入驗證（較好的 error message；不取代 DB constraint）
  -- ---------------------------------------------------------------------------
  if p_group_name is null or btrim(p_group_name) = '' then
    raise exception 'group_name must not be blank';
  end if;

  if p_invite_code is null or p_invite_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'invite_code must be exactly 6 uppercase alphanumeric characters';
  end if;

  -- ---------------------------------------------------------------------------
  -- 3) 建立群組（owner_id = 目前登入者）
  -- ---------------------------------------------------------------------------
  insert into public.groups as g (name, invite_code, owner_id)
  values (p_group_name, p_invite_code, v_user_id)
  returning g.id into v_group_id;

  -- ---------------------------------------------------------------------------
  -- 4) 建立 owner 成員列
  -- ---------------------------------------------------------------------------
  insert into public.group_members (group_id, profile_id, role)
  values (v_group_id, v_user_id, 'owner');

  -- ---------------------------------------------------------------------------
  -- 5) 將目前使用者的 current_group_id 切到新群組
  -- ---------------------------------------------------------------------------
  update public.profiles as p
  set current_group_id = v_group_id
  where p.id = v_user_id;

  if not found then
    raise exception 'Profile not found for current user';
  end if;

  -- ---------------------------------------------------------------------------
  -- 6) 回傳新群組 id
  -- ---------------------------------------------------------------------------
  return v_group_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- COMMENT：供 Schema 瀏覽 / 文件產出使用
-- -----------------------------------------------------------------------------

comment on function public.create_group(text, text) is
  'Create group, create owner membership, and update profiles.current_group_id atomically. Returns the new group id. Caller identity from auth.uid() only.';


-- -----------------------------------------------------------------------------
-- Privileges：僅已登入角色可呼叫；撤銷 public 預設權限
-- -----------------------------------------------------------------------------

revoke all on function public.create_group(text, text) from public;
grant execute on function public.create_group(text, text) to authenticated;
