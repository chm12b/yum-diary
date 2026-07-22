"use client";

import { useEffect, useState } from "react";

import AiMenuJsonImportDialog from "@/components/restaurants/detail/AiMenuJsonImportDialog";
import { listMenuItems, type MenuItem } from "@/src/services/menu-item";

type MenuItemsImportPanelProps = {
  restaurantId: string;
  onToast?: (type: "success" | "error", message: string) => void;
  /** When false, only show the import entry (list lives elsewhere). */
  showSummaryList?: boolean;
};

type LoadStatus = "loading" | "ready" | "error";

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }
  return `$${price}`;
}

/**
 * Shared Menu Items summary + AI JSON import entry.
 * Reuses AiMenuJsonImportDialog; does not own import logic.
 */
export default function MenuItemsImportPanel({
  restaurantId,
  onToast,
  showSummaryList = true,
}: MenuItemsImportPanelProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [reloadToken, setReloadToken] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [importRunId, setImportRunId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const rows = await listMenuItems(restaurantId);
        if (cancelled) {
          return;
        }
        setItems(rows);
        setStatus("ready");
      } catch {
        if (cancelled) {
          return;
        }
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, reloadToken]);

  const hasItems = items.length > 0;

  return (
    <div className="space-y-3 px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-deep-brown">AI 菜單匯入</p>
          <p className="text-[10px] font-medium text-text-secondary">
            {status === "ready"
              ? hasItems
                ? `目前 ${items.length} 項`
                : "尚未匯入"
              : status === "loading"
                ? "載入中…"
                : "載入失敗"}
          </p>
        </div>
        {status === "ready" ? (
          <button
            type="button"
            onClick={() => {
              setImportRunId((value) => value + 1);
              setImportOpen(true);
            }}
            className="shrink-0 rounded-full bg-caramel px-3 py-1.5 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            📥 匯入 AI 菜單
          </button>
        ) : null}
      </div>

      {showSummaryList ? (
        status === "loading" ? (
          <div className="space-y-2" aria-hidden>
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="h-9 w-full animate-pulse rounded-xl bg-border/70"
              />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="rounded-xl border border-border bg-cream-bg/40 px-3 py-4 text-center">
            <p className="text-xs text-cocoa">載入品項失敗</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setReloadToken((token) => token + 1);
              }}
              className="mt-2 text-xs font-bold text-caramel underline-offset-2 hover:underline"
            >
              重新整理
            </button>
          </div>
        ) : hasItems ? (
          <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-cream-bg/30">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-deep-brown">
                    {item.name}
                  </p>
                  <p className="truncate text-[10px] text-text-secondary">
                    {item.category}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs text-cocoa">
                  {formatPrice(item.price)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-cream-bg/30 px-3 py-6 text-center">
            <p className="text-xs text-cocoa/70">尚未匯入菜單品項</p>
            <p className="mt-1 text-[10px] text-cocoa/50">可貼上 AI JSON 匯入</p>
          </div>
        )
      ) : null}

      <AiMenuJsonImportDialog
        key={importRunId}
        open={importOpen}
        restaurantId={restaurantId}
        hasExistingItems={hasItems}
        onClose={() => setImportOpen(false)}
        onImported={(count) => {
          onToast?.("success", `已匯入 ${count} 個菜單品項`);
          setStatus("loading");
          setReloadToken((token) => token + 1);
        }}
      />
    </div>
  );
}
