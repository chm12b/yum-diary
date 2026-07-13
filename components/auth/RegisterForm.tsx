"use client";

import { Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import PasswordInput, {
  authInputClassName,
} from "@/components/auth/PasswordInput";
import { useAuth } from "@/src/hooks/useAuth";

export default function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        displayName,
      });

      if (signUpError) {
        setError("建立帳號失敗");
        return;
      }

      router.replace("/onboarding");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label
          htmlFor="register-nickname"
          className="-mt-[25px] block text-sm font-medium text-deep-brown"
        >
          暱稱
        </label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cocoa"
            strokeWidth={2}
            aria-hidden
          />
          <input
            id="register-nickname"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="請輸入暱稱"
            autoComplete="nickname"
            className={authInputClassName}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-email"
          className="-mt-2.5 block text-sm font-medium text-deep-brown"
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
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="請輸入 Email"
            autoComplete="email"
            className={authInputClassName}
          />
        </div>
      </div>

      <PasswordInput
        id="register-password"
        label="密碼"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />

      <PasswordInput
        id="register-confirm-password"
        label="確認密碼"
        placeholder="請再次輸入密碼"
        value={confirmPassword}
        onChange={setConfirmPassword}
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
        className="-mt-[5px] flex h-12 w-full items-center justify-center rounded-full bg-caramel text-base font-bold text-rice-white shadow-button transition-transform hover:brightness-[0.98] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
      >
        {submitting ? "建立中..." : "🐰 建立帳號"}
      </button>
    </form>
  );
}
