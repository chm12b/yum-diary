"use client";

import { ArrowLeft, Ellipsis, Heart, Pencil, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DetailHeaderProps = {
  isFavorite: boolean;
  restaurantId?: string;
  canSyncGoogle?: boolean;
  isSyncing?: boolean;
  onSyncGoogle?: () => void;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function DetailHeader({
  isFavorite,
  restaurantId,
  canSyncGoogle = false,
  isSyncing = false,
  onSyncGoogle,
}: DetailHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href="/restaurants"
        aria-label="返回"
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
      <div />
      <div className="flex items-center gap-2 justify-self-end">
        <button type="button" aria-label="收藏" className={iconButtonClass}>
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-sakura-pink text-caramel" : "text-deep-brown"
            }`}
            strokeWidth={2}
          />
        </button>
        {restaurantId ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="更多"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
              className={iconButtonClass}
            >
              <Ellipsis className="h-5 w-5" strokeWidth={2} />
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute top-11 right-0 z-30 min-w-[13.5rem] overflow-hidden rounded-2xl border border-border bg-rice-white py-1 shadow-card"
              >
                <Link
                  href={`/restaurants/${restaurantId}/edit`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-deep-brown transition-colors hover:bg-cream-bg"
                >
                  <Pencil className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
                  編輯餐廳
                </Link>
                {canSyncGoogle ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isSyncing}
                    onClick={() => {
                      setMenuOpen(false);
                      onSyncGoogle?.();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-deep-brown transition-colors hover:bg-cream-bg disabled:pointer-events-none disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 shrink-0 text-caramel ${
                        isSyncing ? "animate-spin" : ""
                      }`}
                      strokeWidth={2}
                    />
                    {isSyncing ? "同步中..." : "重新同步 Google 資料"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <button type="button" aria-label="更多" className={iconButtonClass}>
            <Ellipsis className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
