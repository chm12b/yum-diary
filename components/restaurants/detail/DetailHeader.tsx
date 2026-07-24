"use client";

import { ArrowLeft, Ellipsis, Heart, Pencil, RefreshCw, Share } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  buildRestaurantShareMessage,
  buildRestaurantShareUrl,
} from "@/src/lib/app-url";

type DetailHeaderProps = {
  isFavorite: boolean;
  isFavoriteLoading?: boolean;
  restaurantId?: string;
  restaurantName?: string;
  canSyncGoogle?: boolean;
  isSyncing?: boolean;
  onToggleFavorite?: () => void;
  onSyncGoogle?: () => void;
  onToast?: (type: "success" | "error", message: string) => void;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

const menuItemClass =
  "flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-deep-brown transition-colors hover:bg-cream-bg disabled:pointer-events-none disabled:opacity-60";

async function copyShareText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

export default function DetailHeader({
  isFavorite,
  isFavoriteLoading = false,
  restaurantId,
  restaurantName = "",
  canSyncGoogle = false,
  isSyncing = false,
  onToggleFavorite,
  onSyncGoogle,
  onToast,
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

  async function handleShare() {
    if (!restaurantId) {
      return;
    }

    const url = buildRestaurantShareUrl(restaurantId);
    const text = buildRestaurantShareMessage(restaurantName, url);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await copyShareText(text);
      onToast?.("success", "已複製分享連結。");
    } catch {
      onToast?.("error", "分享失敗，請稍後再試。");
    }
  }

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
        <button
          type="button"
          aria-label={isFavorite ? "取消收藏" : "收藏"}
          aria-pressed={isFavorite}
          disabled={isFavoriteLoading || !onToggleFavorite}
          onClick={onToggleFavorite}
          className={iconButtonClass}
        >
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
                  className={menuItemClass}
                >
                  <Pencil className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
                  編輯餐廳
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    void handleShare();
                  }}
                  className={menuItemClass}
                >
                  <Share className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
                  分享餐廳
                </button>
                {canSyncGoogle ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isSyncing}
                    onClick={() => {
                      setMenuOpen(false);
                      onSyncGoogle?.();
                    }}
                    className={menuItemClass}
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
