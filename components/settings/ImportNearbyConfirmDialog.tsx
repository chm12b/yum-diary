"use client";

import { useEffect } from "react";

type ImportNearbyConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ImportNearbyConfirmDialog({
  open,
  onClose,
  onConfirm,
}: ImportNearbyConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onConfirm]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-brown/40 px-6"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="import-nearby-title"
        aria-describedby="import-nearby-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 text-center shadow-card"
      >
        <h2
          id="import-nearby-title"
          className="font-display text-base font-bold text-deep-brown"
        >
          開始匯入附近餐廳？
        </h2>
        <p
          id="import-nearby-desc"
          className="mt-3 text-sm leading-relaxed text-cocoa"
        >
          將使用 Google Places 搜尋附近餐廳。
          <br />
          搜尋可能需要一些時間，
          <br />
          也會消耗 Google Places API 配額。
          <br />
          是否開始？
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            開始搜尋
          </button>
        </div>
      </div>
    </div>
  );
}
