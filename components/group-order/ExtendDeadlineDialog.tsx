"use client";

import { useEffect, useState } from "react";

import {
  EXTEND_DEADLINE_OPTIONS_MINUTES,
  type ExtendDeadlineMinutes,
} from "@/src/services/group-order";

type ExtendDeadlineDialogProps = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (minutes: ExtendDeadlineMinutes) => void | Promise<void>;
};

function ExtendDeadlineDialogBody({
  submitting,
  onClose,
  onConfirm,
}: {
  submitting: boolean;
  onClose: () => void;
  onConfirm: (minutes: ExtendDeadlineMinutes) => void | Promise<void>;
}) {
  const [minutes, setMinutes] = useState<ExtendDeadlineMinutes>(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-3 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:px-4 sm:pb-0"
      onClick={() => {
        if (!submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="extend-deadline-title"
        aria-describedby="extend-deadline-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="extend-deadline-title"
            className="text-center font-display text-base font-bold text-deep-brown"
          >
            重新開放多久？
          </h2>
          <p
            id="extend-deadline-desc"
            className="mt-1.5 text-center text-sm text-text-secondary"
          >
            請選擇重新開放時間。
          </p>
        </div>

        <fieldset className="flex flex-col gap-2 px-5 py-4" disabled={submitting}>
          <legend className="sr-only">重新開放分鐘數</legend>
          {EXTEND_DEADLINE_OPTIONS_MINUTES.map((option) => {
            const selected = minutes === option;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  selected
                    ? "border-caramel bg-milk-tea"
                    : "border-border bg-cream-bg/40 hover:bg-cream-bg/70"
                }`}
              >
                <input
                  type="radio"
                  name="extend-minutes"
                  value={option}
                  checked={selected}
                  onChange={() => setMinutes(option)}
                  className="h-4 w-4 accent-caramel"
                />
                <span className="text-sm font-bold text-[#6E4F38]">
                  {option} 分鐘
                </span>
              </label>
            );
          })}
        </fieldset>

        {error ? (
          <p className="px-5 pb-2 text-center text-sm text-soft-orange" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-rice-white text-sm font-bold text-[#6E4F38] shadow-soft disabled:opacity-55"
          >
            取消
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                try {
                  setError(null);
                  await onConfirm(minutes);
                } catch {
                  setError("重新開放失敗，請再試一次");
                }
              })();
            }}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button disabled:opacity-55"
          >
            {submitting ? "處理中…" : "確定"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExtendDeadlineDialog({
  open,
  submitting = false,
  onClose,
  onConfirm,
}: ExtendDeadlineDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <ExtendDeadlineDialogBody
      submitting={submitting}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
