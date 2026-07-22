import { clearDecidePreferences } from "@/src/services/decide/decide-preferences";

/**
 * Clears client-side auth-related local state after sign-out.
 * `current_group_id` lives in profiles (DB) + CurrentGroupContext (React);
 * the context clears itself when `user` becomes null. Do not wipe the DB field.
 */
export function clearClientAuthState(): void {
  clearDecidePreferences();
}
