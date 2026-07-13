"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

const inputClassName =
  "h-12 w-full rounded-xl border border-border bg-rice-white px-3 pl-10 pr-11 text-sm text-deep-brown placeholder:text-soft-gray transition-colors focus:border-caramel focus:outline-none";

export default function PasswordInput({
  id,
  label,
  placeholder = "請輸入密碼",
  value,
  onChange,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="-mt-[13px] block text-sm font-medium text-deep-brown"
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cocoa"
          strokeWidth={2}
          aria-hidden
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClassName}
        />
        <button
          type="button"
          aria-label={visible ? "隱藏密碼" : "顯示密碼"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-cocoa transition-colors hover:text-deep-brown"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}

export { inputClassName as authInputClassName };
