"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";
import * as authService from "@/src/services/auth/auth.service";
import * as groupService from "@/src/services/groups/group.service";

/** Events that should overwrite client auth state (include cold-start session). */
const SYNC_EVENTS = new Set<AuthChangeEvent>([
  "INITIAL_SESSION",
  "SIGNED_IN",
  "SIGNED_OUT",
  "TOKEN_REFRESHED",
  "USER_UPDATED",
  "PASSWORD_RECOVERY",
]);

export type PostLoginPath = "/" | "/onboarding";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    input: authService.SignInInput,
  ) => Promise<authService.AuthResult<authService.SignInData>>;
  signUp: (
    input: authService.SignUpInput,
  ) => Promise<authService.AuthResult<authService.SignUpData>>;
  signOut: () => Promise<authService.AuthResult<null>>;
  getPostLoginPath: (userId: string) => Promise<PostLoginPath>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function syncAuthState(
  session: Session | null,
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
) {
  setSession(session);
  setUser(session?.user ?? null);
}

/**
 * Home if profile has a usable group, or membership exists (heal pointer).
 * Onboarding only when user is not in any group.
 */
async function resolvePostLoginPath(userId: string): Promise<PostLoginPath> {
  const { data } = await groupService.resolveAndHealCurrentGroup(userId);
  return data ? "/" : "/onboarding";
}

/**
 * Restore a session that is safe for PostgREST (JWT not only from storage).
 * Prefer getUser() so expired access tokens are refreshed before UI loads.
 */
async function restoreValidatedSession(): Promise<Session | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function initializeAuth() {
      try {
        const restored = await restoreValidatedSession();

        if (!isActive) {
          return;
        }

        syncAuthState(restored, setUser, setSession);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!SYNC_EVENTS.has(event)) {
        return;
      }

      // INITIAL_SESSION may race with restoreValidatedSession; prefer
      // non-null session from either source to avoid clearing after restore.
      if (event === "INITIAL_SESSION") {
        if (nextSession) {
          syncAuthState(nextSession, setUser, setSession);
        }
        return;
      }

      syncAuthState(nextSession, setUser, setSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn: (input) => authService.signIn(input),
      signUp: (input) => authService.signUp(input),
      signOut: () => authService.signOut(),
      getPostLoginPath: (userId) => resolvePostLoginPath(userId),
    }),
    [user, session, loading],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
