"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import PasswordInput, {
  authInputClassName,
} from "@/components/auth/PasswordInput";
import { useAuth } from "@/src/hooks/useAuth";
import { getSafeNextPath } from "@/src/lib/auth-next";
import { homeAssets } from "@/src/lib/home-assets";

export default function LoginForm() {
  const router = useRouter();
  const { signIn, getPostLoginPath } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { data, error: signInError } = await signIn({ email, password });

      if (signInError || !data.user) {
        setError("Email 或密碼錯誤");
        return;
      }

      const defaultPath = await getPostLoginPath(data.user.id);
      const params = new URLSearchParams(window.location.search);
      const path = getSafeNextPath(params.get("next"), defaultPath);
      router.replace(path);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="-mt-5 block text-sm font-medium text-deep-brown"
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
            id="login-email"
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
        id="login-password"
        label="密碼"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="-mt-3 text-xs text-text-secondary transition-colors hover:text-deep-brown"
        >
          忘記密碼？
        </button>
      </div>

      {error ? (
        <p className="-mt-1 text-center text-sm text-cocoa" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="-mt-2.5 flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-caramel text-base font-bold text-rice-white shadow-button transition-transform hover:brightness-[0.98] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
      >
        <Image
          src={homeAssets.loginButtonIcon}
          alt=""
          width={50}
          height={60}
          className="-mx-2.5 h-[60px] w-[50px] rotate-[10deg] object-contain"
          aria-hidden
        />
        {submitting ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
