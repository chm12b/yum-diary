"use client";

import { useEffect, useState } from "react";

type AiMenuParserPreviewDialogProps = {
  open: boolean;
  photoLabel: string;
  model: string | null;
  rawText: string | null;
  prettyJson: string | null;
  isValidJson: boolean | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onCopied?: () => void;
};

export default function AiMenuParserPreviewDialog({
  open,
  photoLabel,
  model,
  rawText,
  prettyJson,
  isValidJson,
  isLoading,
  error,
  onClose,
  onCopied,
}: AiMenuParserPreviewDialogProps) {
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
    if (!prettyJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prettyJson);
      setCopyState("copied");
      onCopied?.();
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-3 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:px-4 sm:pb-0"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-menu-parser-title"
        aria-describedby="ai-menu-parser-desc"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(88vh,40rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="ai-menu-parser-title"
            className="font-display text-base font-bold text-deep-brown"
          >
            AI Menu Parser Preview
          </h2>
          <p
            id="ai-menu-parser-desc"
            className="mt-1 text-xs text-text-secondary"
          >
            {photoLabel} · Vision OCR → OpenAI（Dev）
            {isValidJson === false ? " · JSON 無效" : null}
            {isValidJson === true ? " · JSON 合法" : null}
          </p>
          {model ? (
            <p className="mt-1.5 font-mono text-xs text-deep-brown">
              Model: {model}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3" aria-live="polite">
              <div className="h-4 w-2/3 animate-pulse rounded bg-border/80" />
              <div className="h-4 w-full animate-pulse rounded bg-border/70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-border/70" />
              <p className="pt-2 text-sm text-cocoa">OCR + AI 解析中…</p>
            </div>
          ) : error ? (
            <p className="text-sm leading-relaxed text-red-500">{error}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <section className="min-w-0">
                <h3 className="mb-2 text-xs font-bold tracking-wide text-text-secondary uppercase">
                  Raw OCR Text
                </h3>
                <pre className="max-h-[min(52vh,24rem)] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-cream-bg/40 p-3 font-mono text-[11px] leading-relaxed text-deep-brown">
                  {rawText?.trim() ? rawText : "（未偵測到文字）"}
                </pre>
              </section>

              <section className="min-w-0">
                <h3 className="mb-2 text-xs font-bold tracking-wide text-text-secondary uppercase">
                  Pretty JSON
                </h3>
                <pre className="max-h-[min(52vh,24rem)] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-cream-bg/40 p-3 font-mono text-[11px] leading-relaxed text-deep-brown">
                  {prettyJson?.trim() ? prettyJson : "[]"}
                </pre>
              </section>
            </div>
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
            disabled={isLoading || !prettyJson?.trim()}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copyState === "copied"
              ? "已複製"
              : copyState === "failed"
                ? "複製失敗"
                : "複製 JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
