-- =============================================================================
-- Migration : 003_create_profile_trigger.sql
-- Project   : Yum Diary
-- Purpose   : auth.users INSERT 時自動建立 public.profiles
--
-- 依賴：
--   • 002_profiles.sql → public.profiles
--   • auth.users（Supabase Auth 內建）
--
-- 本檔範圍：
--   ✅ Trigger function：public.handle_new_user()
--   ✅ AFTER INSERT trigger on auth.users
--   ❌ RLS / Policy
--   ❌ 其他 Table
--
-- 參考：
--   Supabase Docs → Auth → Managing User Data
--   （SECURITY DEFINER + SET search_path = ''）
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Function: public.handle_new_user()
--
-- 用途：
--   當新使用者寫入 auth.users 後，自動在 public.profiles 建立 1:1 資料列。
--
-- 寫入欄位：
--   • id           = NEW.id（與 auth.users 相同 UUID）
--   • display_name = raw_user_meta_data.display_name
--                    若不存在 / 空白 → 預設「新使用者」
--                    並限制最多 50 字元，以符合 profiles CHECK
--
-- 設計說明（為何這樣寫）：
--
--   1) RETURNS TRIGGER + AFTER INSERT
--      Auth 使用者列已成功寫入後再建立 profile，避免 signup 中途不一致。
--
--   2) SECURITY DEFINER
--      官方推薦：signup 當下呼叫端通常無權 INSERT profiles。
--      DEFINER 以函式擁有者權限執行，確保能寫入 public.profiles。
--
--   3) SET search_path = ''
--      SECURITY DEFINER 必須鎖定 search_path，避免 search_path hijacking。
--      函式內一律使用 schema-qualified 名稱（public.profiles）。
--
--   4) ON CONFLICT (id) DO NOTHING
--      幂等：若 profile 已存在（重試、手動建立、重複觸發），不報錯、不覆蓋。
--      避免因唯一鍵衝突導致 Auth signup 失敗。
--
--   5) display_name 防呆
--      nullif(btrim(...), '') 處理缺值與空白字串；
--      left(..., 50) 避免超過 profiles_display_name_length_check 而使整次註冊失敗。
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
        '新使用者'
      ),
      50
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT on auth.users: creates public.profiles row (id, display_name). '
  'display_name from raw_user_meta_data.display_name, else ''新使用者''. '
  'SECURITY DEFINER with empty search_path; ON CONFLICT DO NOTHING for idempotency.';


-- -----------------------------------------------------------------------------
-- Trigger: on_auth_user_created
--
-- 掛在 auth.users：每位新使用者建立後觸發 handle_new_user()。
-- -----------------------------------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
