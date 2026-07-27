"use client";

import { useEffect } from "react";

type UnarchiveRestaurantDialogProps = {
  open: boolean;
  restaurantName?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const RESTORE_ITEMS = [
  "收藏",
  "搜尋",
  "附近餐廳",
  "餐廳列表",
] as const;

export default function UnarchiveRestaurantDialog({
  open,
  restaurantName,
  submitting = false,
  onClose,
  onConfirm,
}: UnarchiveRestaurantDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-brown/40 px-6"
      onClick={() => {
        if (!submitting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unarchive-restaurant-title"
        aria-describedby="unarchive-restaurant-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 shadow-card"
      >
        <h2
          id="unarchive-restaurant-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          ↩️ 恢復餐廳？
        </h2>
        {restaurantName ? (
          <p className="mt-2 truncate text-center text-sm font-medium text-cocoa">
            {restaurantName}
          </p>
        ) : null}
        <p
          id="unarchive-restaurant-desc"
          className="mt-3 text-center text-sm leading-relaxed text-cocoa"
        >
          恢復後，餐廳將重新出現在：
        </p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-cocoa">
          {RESTORE_ITEMS.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-2 text-center text-sm leading-relaxed text-cocoa">
          並可再次發起共同點餐。
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg disabled:opacity-70"
          >
            取消
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void onConfirm();
            }}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? "恢復中…" : "恢復餐廳"}
          </button>
        </div>
      </div>
    </div>
  );
}
