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
import * as profileService from "@/src/services/profile/profile.service";

const SYNC_EVENTS = new Set<AuthChangeEvent>([
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

async function resolvePostLoginPath(userId: string): Promise<PostLoginPath> {
  const { data, error } = await profileService.getCurrentGroupId(userId);

  if (error || !data || data.current_group_id == null) {
    return "/onboarding";
  }

  return "/";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function initializeAuth() {
      try {
        const { data } = await authService.getSession();

        if (!isActive) {
          return;
        }

        syncAuthState(data.session, setUser, setSession);
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
