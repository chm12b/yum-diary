"use client";

import { useEffect } from "react";

type DeleteGroupDialogProps = {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DELETE_ITEMS = [
  "所有餐廳",
  "所有美食日記",
  "所有餐點紀錄",
  "所有照片",
  "所有菜單照片",
  "所有群組成員",
] as const;

export default function DeleteGroupDialog({
  open,
  submitting,
  onClose,
  onConfirm,
}: DeleteGroupDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Enter" && !submitting) {
        event.preventDefault();
        void onConfirm();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onConfirm, submitting]);

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
        aria-labelledby="delete-group-title"
        aria-describedby="delete-group-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 shadow-card"
      >
        <h2
          id="delete-group-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          解散群組？
        </h2>
        <p
          id="delete-group-desc"
          className="mt-3 text-center text-sm font-medium text-status-closed-fg"
        >
          此操作無法復原。
        </p>
        <p className="mt-3 text-sm text-cocoa">將永久刪除：</p>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-cocoa">
          {DELETE_ITEMS.map((item) => (
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
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? "解散中…" : "解散群組"}
          </button>
        </div>
      </div>
    </div>
  );
}
