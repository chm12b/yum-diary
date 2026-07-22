"use client";

import { useEffect } from "react";

import MenuItemForm, {
  type MenuItemFormValues,
} from "@/components/menu/MenuItemForm";
import type { MenuItem } from "@/src/services/menu-item";

type MenuItemFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialItem?: MenuItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: MenuItemFormValues) => void | Promise<void>;
};

export default function MenuItemFormDialog({
  open,
  mode,
  initialItem = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: MenuItemFormDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isSubmitting]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-3 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:px-4 sm:pb-0"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-item-form-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="menu-item-form-title"
            className="font-display text-base font-bold text-deep-brown"
          >
            {mode === "create" ? "新增品項" : "編輯品項"}
          </h2>
        </div>
        <div className="px-5 py-4">
          <MenuItemForm
            key={initialItem?.id ?? "create"}
            initialItem={mode === "edit" ? initialItem : null}
            isSubmitting={isSubmitting}
            submitLabel={mode === "create" ? "新增" : "儲存"}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
