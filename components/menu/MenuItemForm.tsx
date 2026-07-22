"use client";

import { useState } from "react";

import {
  MENU_ITEM_CATEGORY_MAX,
  MENU_ITEM_DEFAULT_CATEGORY,
  MENU_ITEM_NAME_MAX,
  type MenuItem,
} from "@/src/services/menu-item";

export type MenuItemFormValues = {
  category: string;
  name: string;
  price: number | null;
};

type MenuItemFormProps = {
  initialItem?: MenuItem | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: MenuItemFormValues) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Shared create / edit form for menu items.
 * Fields: category (required), name (required), price (number | null).
 * Remount via `key` when switching create/edit target.
 */
export default function MenuItemForm({
  initialItem = null,
  isSubmitting = false,
  submitLabel = "儲存",
  onSubmit,
  onCancel,
}: MenuItemFormProps) {
  const [category, setCategory] = useState(
    initialItem?.category ?? MENU_ITEM_DEFAULT_CATEGORY,
  );
  const [name, setName] = useState(initialItem?.name ?? "");
  const [priceText, setPriceText] = useState(
    initialItem?.price === null || initialItem?.price === undefined
      ? ""
      : String(initialItem.price),
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedCategory = category.trim();
    const trimmedName = name.trim();

    if (!trimmedCategory) {
      setError("請填寫分類。");
      return;
    }
    if (!trimmedName) {
      setError("請填寫品項名稱。");
      return;
    }

    let price: number | null = null;
    const trimmedPrice = priceText.trim();
    if (trimmedPrice !== "") {
      const parsed = Number(trimmedPrice);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError("價格必須為數字（可留空）。");
        return;
      }
      price = parsed;
    }

    await onSubmit({
      category: trimmedCategory.slice(0, MENU_ITEM_CATEGORY_MAX),
      name: trimmedName.slice(0, MENU_ITEM_NAME_MAX),
      price,
    });
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-deep-brown">
          分類 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={category}
          maxLength={MENU_ITEM_CATEGORY_MAX}
          disabled={isSubmitting}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="例如：純喝茶"
          className="h-11 w-full rounded-xl border border-border bg-cream-bg/40 px-3 text-sm text-deep-brown outline-none focus:border-caramel disabled:opacity-60"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-deep-brown">
          品項名稱 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={name}
          maxLength={MENU_ITEM_NAME_MAX}
          disabled={isSubmitting}
          onChange={(event) => setName(event.target.value)}
          placeholder="例如：古早味紅茶"
          className="h-11 w-full rounded-xl border border-border bg-cream-bg/40 px-3 text-sm text-deep-brown outline-none focus:border-caramel disabled:opacity-60"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-deep-brown">價格</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="1"
          value={priceText}
          disabled={isSubmitting}
          onChange={(event) => setPriceText(event.target.value)}
          placeholder="留空表示無價格"
          className="h-11 w-full rounded-xl border border-border bg-cream-bg/40 px-3 font-mono text-sm text-deep-brown outline-none focus:border-caramel disabled:opacity-60"
        />
      </label>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98] disabled:opacity-60"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "儲存中…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
