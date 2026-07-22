"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

import type { MenuItem } from "@/src/services/menu-item";

type MenuManageItemListProps = {
  items: MenuItem[];
  busyItemId: string | null;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onMoveUp: (item: MenuItem) => void;
  onMoveDown: (item: MenuItem) => void;
};

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }
  return `$${price}`;
}

export default function MenuManageItemList({
  items,
  busyItemId,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: MenuManageItemListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-10 text-center shadow-soft">
        <p className="text-sm text-cocoa/70">尚未新增菜單品項</p>
        <p className="mt-1 text-xs text-cocoa/50">
          可手動新增，或使用上方 AI JSON 匯入
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
      {items.map((item, index) => {
        const busy = busyItemId === item.id;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="px-3 py-3 sm:px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-deep-brown">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {item.category}
                </p>
                <p className="mt-1 font-mono text-sm text-cocoa">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label="上移"
                  disabled={busy || isFirst}
                  onClick={() => onMoveUp(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-cocoa transition-colors hover:bg-cream-bg disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  aria-label="下移"
                  disabled={busy || isLast}
                  onClick={() => onMoveDown(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-cocoa transition-colors hover:bg-cream-bg disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  aria-label="編輯"
                  disabled={busy}
                  onClick={() => onEdit(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-caramel transition-colors hover:bg-cream-bg disabled:opacity-30"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  aria-label="刪除"
                  disabled={busy}
                  onClick={() => onDelete(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-red-500 transition-colors hover:bg-red-50 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
