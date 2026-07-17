"use client";

import { useEffect, useRef, useState } from "react";

type RenameGroupSheetProps = {
  open: boolean;
  currentName: string;
  submitting: boolean;
  onClose: () => void;
  onSave: (nextName: string) => Promise<void>;
};

const MAX_NAME_LENGTH = 100;

export default function RenameGroupSheet({
  open,
  currentName,
  submitting,
  onClose,
  onSave,
}: RenameGroupSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const canSave =
    trimmed.length > 0 &&
    trimmed !== currentName.trim() &&
    trimmed.length <= MAX_NAME_LENGTH &&
    !submitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(currentName);
    setError(null);

    const frame = window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, currentName]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmed) {
      setError("請輸入群組名稱");
      return;
    }

    if (trimmed === currentName.trim()) {
      return;
    }

    setError(null);
    await onSave(trimmed);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-deep-brown/35"
        disabled={submitting}
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-group-title"
        className="relative z-10 w-full max-w-app rounded-t-3xl border border-border bg-rice-white px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-card"
      >
        <h2
          id="rename-group-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          修改群組名稱
        </h2>
        <p className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
          新的群組名稱會立即同步給所有成員。
        </p>

        <div className="my-4 border-t border-dashed border-border" />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="rename-group-name"
              className="block text-sm font-medium text-deep-brown"
            >
              群組名稱
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="rename-group-name"
                type="text"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                disabled={submitting}
                autoComplete="off"
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                className="h-12 w-full rounded-xl border border-border bg-cream-bg/60 px-3 pr-14 text-sm text-deep-brown placeholder:text-cocoa/50 focus:border-caramel focus:outline-none focus:ring-1 focus:ring-caramel/40 disabled:opacity-70"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-text-secondary">
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
            {error ? (
              <p className="text-center text-sm text-cocoa" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="my-1 border-t border-dashed border-border" />

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98] disabled:opacity-70"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "儲存中…" : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
