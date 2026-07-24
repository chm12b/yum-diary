"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type MenuPageHeaderProps = {
  title: string;
  subtitle?: string;
  /** When set, replaces default router.back(). */
  onBack?: () => void;
  /** Optional right-side action (e.g. copy). */
  rightAction?: ReactNode;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function MenuPageHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: MenuPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="px-5 pt-4 pb-2">
      <div className="grid grid-cols-3 items-center">
        <button
          type="button"
          aria-label="返回上一頁"
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            router.back();
          }}
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <h1 className="justify-self-center text-center font-display text-base font-bold text-deep-brown">
          {title}
        </h1>
        <div className="justify-self-end">{rightAction ?? null}</div>
      </div>
      {subtitle ? (
        <p className="mt-1 truncate text-center text-xs text-text-secondary">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
