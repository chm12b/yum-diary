"use client";

import { useEffect } from "react";

type StopOrderingDialogProps = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const CONFIRM_ITEMS = [
  "所有人將無法再修改餐點。",
  "你仍可重新開放點餐。",
  "或完成此次訂單。",
] as const;

export default function StopOrderingDialog({
  open,
  submitting = false,
  onClose,
  onConfirm,
}: StopOrderingDialogProps) {
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
        aria-labelledby="stop-ordering-title"
        aria-describedby="stop-ordering-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 shadow-card"
      >
        <h2
          id="stop-ordering-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          停止點單？
        </h2>
        <p
          id="stop-ordering-desc"
          className="mt-3 text-center text-sm font-medium text-cocoa"
        >
          停止後：
        </p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-cocoa">
          {CONFIRM_ITEMS.map((item) => (
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
            {submitting ? "處理中…" : "停止點單"}
          </button>
        </div>
      </div>
    </div>
  );
}
