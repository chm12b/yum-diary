"use client";

import { useEffect } from "react";

type LeaveGroupDialogProps = {
  open: boolean;
  groupName: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function LeaveGroupDialog({
  open,
  groupName,
  submitting,
  onClose,
  onConfirm,
}: LeaveGroupDialogProps) {
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
        aria-labelledby="leave-group-title"
        aria-describedby="leave-group-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 text-center shadow-card"
      >
        <h2
          id="leave-group-title"
          className="font-display text-base font-bold text-deep-brown"
        >
          離開群組？
        </h2>
        <p
          id="leave-group-desc"
          className="mt-3 text-sm leading-relaxed text-cocoa"
        >
          離開後將無法再查看此群組的餐廳、美食日記與照片。
          <br />
          之後需要重新接受邀請才能再次加入。
        </p>
        <p className="mt-2 text-xs text-text-secondary">（{groupName}）</p>

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
            {submitting ? "離開中…" : "離開群組"}
          </button>
        </div>
      </div>
    </div>
  );
}
