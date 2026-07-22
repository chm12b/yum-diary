"use client";

import { useEffect, useState } from "react";

import { importMenuItemsFromJson } from "@/src/services/menu-item/importMenuItemsFromJson";
import {
  groupMenuImportByCategory,
  parseMenuImportJson,
  type MenuImportJsonItem,
} from "@/src/services/menu-item/parseMenuImportJson";

type AiMenuJsonImportDialogProps = {
  open: boolean;
  restaurantId: string;
  hasExistingItems: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
};

type Step = "edit" | "preview" | "confirmOverwrite";

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }
  return `$${price}`;
}

export default function AiMenuJsonImportDialog({
  open,
  restaurantId,
  hasExistingItems,
  onClose,
  onImported,
}: AiMenuJsonImportDialogProps) {
  const [step, setStep] = useState<Step>("edit");
  const [rawJson, setRawJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [items, setItems] = useState<MenuImportJsonItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isImporting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isImporting]);

  if (!open) {
    return null;
  }

  function handleParse() {
    setParseError(null);
    setImportError(null);

    const result = parseMenuImportJson(rawJson);
    if (!result.ok) {
      setParseError(result.message);
      setItems([]);
      return;
    }

    if (result.items.length === 0) {
      setParseError("JSON 沒有品項。");
      setItems([]);
      return;
    }

    setItems(result.items);
    setStep("preview");
  }

  async function runImport(overwrite: boolean) {
    setIsImporting(true);
    setImportError(null);

    try {
      const count = await importMenuItemsFromJson({
        restaurantId,
        items,
        overwrite,
      });
      onImported(count);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "匯入失敗，請稍後再試";
      setImportError(message);
      setStep("preview");
    } finally {
      setIsImporting(false);
    }
  }

  function handleImportClick() {
    if (hasExistingItems) {
      setStep("confirmOverwrite");
      return;
    }
    void runImport(false);
  }

  const groups = groupMenuImportByCategory(items);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-3 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:px-4 sm:pb-0"
      onClick={() => {
        if (!isImporting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-menu-json-import-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(88vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="ai-menu-json-import-title"
            className="font-display text-base font-bold text-deep-brown"
          >
            {step === "confirmOverwrite" ? "覆蓋確認" : "AI JSON 匯入"}
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            {step === "edit"
              ? "貼上 AI 產生的菜單 JSON"
              : step === "preview"
                ? `預覽 ${items.length} 個品項`
                : "此餐廳已有菜單"}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === "edit" ? (
            <div className="space-y-3">
              <textarea
                value={rawJson}
                onChange={(event) => {
                  setRawJson(event.target.value);
                  setParseError(null);
                }}
                placeholder={`[\n  {\n    "category": "純喝茶",\n    "name": "古早味紅茶",\n    "price": 30\n  }\n]`}
                rows={12}
                className="w-full resize-y rounded-xl border border-border bg-cream-bg/40 px-3 py-3 font-mono text-xs leading-relaxed text-deep-brown outline-none focus:border-caramel"
              />
              {parseError ? (
                <p className="text-sm text-red-500">{parseError}</p>
              ) : null}
            </div>
          ) : null}

          {step === "preview" ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <section key={group.category}>
                  <h3 className="mb-2 text-xs font-bold tracking-wide text-text-secondary uppercase">
                    {group.category}
                  </h3>
                  <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-cream-bg/30">
                    {group.items.map((item, index) => (
                      <li
                        key={`${group.category}-${item.name}-${index}`}
                        className="flex items-baseline justify-between gap-3 px-3 py-2.5"
                      >
                        <p className="min-w-0 truncate text-sm text-deep-brown">
                          {item.name}
                        </p>
                        <p className="shrink-0 font-mono text-sm text-cocoa">
                          {formatPrice(item.price)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {importError ? (
                <p className="text-sm text-red-500">{importError}</p>
              ) : null}
            </div>
          ) : null}

          {step === "confirmOverwrite" ? (
            <p className="text-sm leading-relaxed text-cocoa">
              此餐廳已有菜單，是否覆蓋？
              <br />
              覆蓋後會刪除現有品項，再匯入新的 JSON。
            </p>
          ) : null}
        </div>

        <div className="flex gap-2.5 border-t border-border px-5 py-4">
          {step === "edit" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleParse}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                解析
              </button>
            </>
          ) : null}

          {step === "preview" ? (
            <>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setStep("edit")}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98] disabled:opacity-60"
              >
                返回
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={handleImportClick}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {isImporting ? "匯入中…" : "匯入"}
              </button>
            </>
          ) : null}

          {step === "confirmOverwrite" ? (
            <>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setStep("preview")}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98] disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => {
                  void runImport(true);
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {isImporting ? "覆蓋中…" : "覆蓋"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
