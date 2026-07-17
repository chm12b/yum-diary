"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/src/lib/supabase/client";
import {
  signOut,
  updatePassword,
} from "@/src/services/auth/auth.service";

type LoadStatus = "loading" | "ready" | "expired";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;
const SUCCESS_NAVIGATE_MS = 900;
const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const supabase = createClient();

    function markReady() {
      if (cancelled || settled) {
        return;
      }
      settled = true;
      setLoadStatus("ready");
    }

    function markExpired() {
      if (cancelled || settled) {
        return;
      }
      settled = true;
      setLoadStatus("expired");
    }

    async function resolveRecoverySession() {
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const searchParams = new URLSearchParams(window.location.search);

      const linkError =
        hashParams.get("error") ||
        searchParams.get("error") ||
        hashParams.get("error_code") ||
        searchParams.get("error_code");

      if (linkError) {
        markExpired();
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) {
          return;
        }

        if (exchangeError) {
          markExpired();
          return;
        }

        window.history.replaceState({}, "", "/reset-password");
        markReady();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) {
        return;
      }

      if (session) {
        markReady();
        return;
      }

      // Implicit / hash recovery may settle slightly after mount.
      window.setTimeout(() => {
        void (async () => {
          if (cancelled || settled) {
            return;
          }

          const {
            data: { session: delayedSession },
          } = await supabase.auth.getSession();

          if (delayedSession) {
            markReady();
            return;
          }

          markExpired();
        })();
      }, 1200);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) {
        return;
      }

      if (
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") &&
        session
      ) {
        markReady();
      }
    });

    void resolveRecoverySession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  function validatePasswords(nextPassword: string, nextConfirm: string) {
    if (nextPassword.length > 0 && nextPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`密碼至少 ${MIN_PASSWORD_LENGTH} 碼`);
      return false;
    }

    if (nextConfirm.length > 0 && nextPassword !== nextConfirm) {
      setError("兩次輸入的密碼不一致");
      return false;
    }

    setError(null);
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`密碼至少 ${MIN_PASSWORD_LENGTH} 碼`);
      return;
    }

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const { error: updateError } = await updatePassword({ password });

      if (updateError) {
        showToast("error", "更新失敗，請稍後再試。");
        return;
      }

      showToast("success", "密碼已更新。");
      await signOut();

      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
      navigateTimerRef.current = window.setTimeout(() => {
        router.replace("/auth");
        navigateTimerRef.current = null;
      }, SUCCESS_NAVIGATE_MS);
    } catch {
      showToast("error", "更新失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadStatus === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-bg px-5">
        <div className="h-10 w-40 animate-pulse rounded-full bg-border" />
      </div>
    );
  }

  if (loadStatus === "expired") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-bg px-5">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 text-center shadow-soft">
          <p className="text-4xl" aria-hidden>
            🔐
          </p>
          <h1 className="mt-3 font-display text-lg font-bold text-deep-brown">
            此重設連結已失效。
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cocoa">
            請重新申請重設密碼。
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button"
          >
            返回登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-bg px-5">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 shadow-soft">
        <div className="text-center">
          <p className="text-4xl" aria-hidden>
            🔐
          </p>
          <h1 className="mt-3 font-display text-lg font-bold text-deep-brown">
            重新設定密碼
          </h1>
        </div>

        <div className="my-5 border-t border-dashed border-border" />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordInput
            id="reset-password"
            label="新密碼"
            placeholder="請輸入新密碼"
            value={password}
            onChange={(value) => {
              setPassword(value);
              validatePasswords(value, confirmPassword);
            }}
            autoComplete="new-password"
          />

          <PasswordInput
            id="reset-confirm-password"
            label="再次輸入"
            placeholder="請再次輸入密碼"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              validatePasswords(password, value);
            }}
            autoComplete="new-password"
          />

          {error ? (
            <p className="-mt-1 text-center text-sm text-cocoa" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
          >
            {submitting ? "更新中…" : "更新密碼"}
          </button>
        </form>

        <div className="my-5 border-t border-dashed border-border" />
      </div>

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-8 z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
