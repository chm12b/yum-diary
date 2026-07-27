"use client";

import { useEffect } from "react";

type ArchiveRestaurantDialogProps = {
  open: boolean;
  restaurantName?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const KEEP_ITEMS = [
  "美食日記",
  "共同點餐",
  "菜單",
  "照片",
] as const;

export default function ArchiveRestaurantDialog({
  open,
  restaurantName,
  submitting = false,
  onClose,
  onConfirm,
}: ArchiveRestaurantDialogProps) {
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
        aria-labelledby="archive-restaurant-title"
        aria-describedby="archive-restaurant-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 shadow-card"
      >
        <h2
          id="archive-restaurant-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          📦 封存餐廳？
        </h2>
        {restaurantName ? (
          <p className="mt-2 truncate text-center text-sm font-medium text-cocoa">
            {restaurantName}
          </p>
        ) : null}
        <p
          id="archive-restaurant-desc"
          className="mt-3 text-center text-sm leading-relaxed text-cocoa"
        >
          封存後，餐廳將不再出現在一般列表，
          <br />
          但所有歷史資料仍會保留：
        </p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-cocoa">
          {KEEP_ITEMS.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>

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
            {submitting ? "封存中…" : "封存餐廳"}
          </button>
        </div>
      </div>
    </div>
  );
}
