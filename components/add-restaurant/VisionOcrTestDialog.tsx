"use client";

import { useEffect, useState } from "react";

type VisionOcrTestDialogProps = {
  open: boolean;
  photoLabel: string;
  rawText: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onCopied?: () => void;
};

export default function VisionOcrTestDialog({
  open,
  photoLabel,
  rawText,
  isLoading,
  error,
  onClose,
  onCopied,
}: VisionOcrTestDialogProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  async function handleCopy() {
    if (!rawText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(rawText);
      setCopyState("copied");
      onCopied?.();
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-4 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:pb-0"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vision-ocr-title"
        aria-describedby="vision-ocr-desc"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(80vh,36rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="vision-ocr-title"
            className="font-display text-base font-bold text-deep-brown"
          >
            Google Vision OCR
          </h2>
          <p id="vision-ocr-desc" className="mt-1 text-xs text-text-secondary">
            {photoLabel} · Raw Text（Dev）
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-2" aria-live="polite">
              <div className="h-4 w-3/4 animate-pulse rounded bg-border/80" />
              <div className="h-4 w-full animate-pulse rounded bg-border/70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-border/70" />
              <p className="pt-2 text-sm text-cocoa">辨識中…</p>
            </div>
          ) : error ? (
            <p className="text-sm leading-relaxed text-red-500">{error}</p>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-deep-brown">
              {rawText?.trim() ? rawText : "（未偵測到文字）"}
            </pre>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98]"
          >
            關閉
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCopy();
            }}
            disabled={isLoading || !rawText?.trim()}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copyState === "copied"
              ? "已複製"
              : copyState === "failed"
                ? "複製失敗"
                : "複製"}
          </button>
        </div>
      </div>
    </div>
  );
}
