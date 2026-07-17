"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useRef, useState } from "react";

import {
  authInputClassName,
} from "@/components/auth/PasswordInput";
import { buildResetPasswordUrl } from "@/src/lib/app-url";
import { resetPasswordForEmail } from "@/src/services/auth/auth.service";

type PageStatus = "form" | "success";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>("form");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("請輸入 Email");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("請輸入有效的 Email");
      return;
    }

    setSubmitting(true);

    try {
      const { error: resetError } = await resetPasswordForEmail({
        email: trimmed,
        redirectTo: buildResetPasswordUrl(),
      });

      if (resetError) {
        showToast("error", "寄送失敗，請稍後再試。");
        return;
      }

      setSentEmail(trimmed);
      setStatus("success");
    } catch {
      showToast("error", "寄送失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-bg px-5">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-rice-white px-5 py-8 text-center shadow-soft">
          <p className="text-4xl" aria-hidden>
            📮
          </p>
          <h1 className="mt-3 font-display text-lg font-bold text-deep-brown">
            重設密碼信已寄出！
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cocoa">
            我們已將重設密碼信寄到：
          </p>
          <p className="mt-1 text-sm font-medium break-all text-deep-brown">
            {sentEmail}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cocoa">
            請到信箱查看，
            <br />
            如果沒有收到，也可以檢查垃圾郵件。
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
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
            🐰
          </p>
          <h1 className="mt-3 font-display text-lg font-bold text-deep-brown">
            忘記密碼？
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">
            輸入你的 Email，
            <br />
            我們會寄送一封重設密碼信給你。
          </p>
        </div>

        <div className="my-5 border-t border-dashed border-border" />

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-deep-brown"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cocoa"
                strokeWidth={2}
                aria-hidden
              />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="請輸入 Email"
                autoComplete="email"
                className={authInputClassName}
              />
            </div>
          </div>

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
            {submitting ? "寄送中…" : "寄送重設密碼信"}
          </button>
        </form>

        <div className="my-5 border-t border-dashed border-border" />

        <div className="text-center">
          <Link
            href="/auth"
            className="text-sm text-text-secondary transition-colors hover:text-deep-brown"
          >
            返回登入
          </Link>
        </div>
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
