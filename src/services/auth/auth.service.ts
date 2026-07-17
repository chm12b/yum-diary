import type {
  AuthError,
  AuthTokenResponsePassword,
  AuthResponse,
  Session,
  User,
} from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";

export type AuthResult<T> = {
  data: T;
  error: AuthError | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpData = AuthResponse["data"];
export type SignInData = AuthTokenResponsePassword["data"];
export type SessionData = {
  session: Session | null;
};
export type UserData = {
  user: User | null;
};

export async function signUp({
  email,
  password,
  displayName,
}: SignUpInput): Promise<AuthResult<SignUpData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  return { data, error };
}

export async function signIn({
  email,
  password,
}: SignInInput): Promise<AuthResult<SignInData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut(): Promise<AuthResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  return { data: null, error };
}

export async function getSession(): Promise<AuthResult<SessionData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  return { data, error };
}

export async function getUser(): Promise<AuthResult<UserData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { data, error };
}

export type ResetPasswordForEmailInput = {
  email: string;
  redirectTo: string;
};

export async function resetPasswordForEmail({
  email,
  redirectTo,
}: ResetPasswordForEmailInput): Promise<AuthResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return { data: null, error };
}

export type UpdatePasswordInput = {
  password: string;
};

export async function updatePassword({
  password,
}: UpdatePasswordInput): Promise<AuthResult<UserData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({ password });

  return { data, error };
}
