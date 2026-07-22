"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import MenuItemsImportPanel from "@/components/add-restaurant/MenuItemsImportPanel";
import MenuManagerSection from "@/components/add-restaurant/MenuManagerSection";
import MenuItemFormDialog from "@/components/menu/MenuItemFormDialog";
import type { MenuItemFormValues } from "@/components/menu/MenuItemForm";
import MenuManageItemList from "@/components/menu/MenuManageItemList";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { getRestaurant } from "@/src/services/restaurant";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  moveMenuItemDown,
  moveMenuItemUp,
  updateMenuItem,
  type MenuItem,
} from "@/src/services/menu-item";

type MenuManagePageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type FormMode = "create" | "edit" | null;

export default function MenuManagePage({ restaurantId }: MenuManagePageProps) {
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [itemsReloadToken, setItemsReloadToken] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const restaurant = await getRestaurant(restaurantId);
        if (cancelled) {
          return;
        }
        if (!restaurant) {
          setStatus("not-found");
          return;
        }
        setRestaurantName(restaurant.name);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const rows = await listMenuItems(restaurantId);
        if (!cancelled) {
          setItems(rows);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, status, itemsReloadToken]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2200);
  }

  function reloadItems() {
    setItemsReloadToken((token) => token + 1);
  }

  function handleImportToast(type: "success" | "error", message: string) {
    showToast(type, message);
    if (type === "success") {
      reloadItems();
    }
  }

  async function handleFormSubmit(values: MenuItemFormValues) {
    setIsSubmitting(true);
    try {
      if (formMode === "create") {
        const nextOrder =
          items.reduce((max, item) => Math.max(max, item.displayOrder), 0) + 1;
        await createMenuItem({
          restaurantId,
          category: values.category,
          name: values.name,
          price: values.price,
          displayOrder: nextOrder,
        });
        showToast("success", "已新增品項");
      } else if (formMode === "edit" && editingItem) {
        await updateMenuItem({
          id: editingItem.id,
          category: values.category,
          name: values.name,
          price: values.price,
        });
        showToast("success", "已更新品項");
      }
      setFormMode(null);
      setEditingItem(null);
      reloadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "儲存失敗，請稍後再試";
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }
    const target = deleteTarget;
    setBusyItemId(target.id);
    try {
      await deleteMenuItem({ id: target.id });
      setDeleteTarget(null);
      showToast("success", "已刪除品項");
      reloadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "刪除失敗，請稍後再試";
      showToast("error", message);
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleMoveUp(item: MenuItem) {
    setBusyItemId(item.id);
    try {
      await moveMenuItemUp(restaurantId, item.id);
      reloadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "排序失敗，請稍後再試";
      showToast("error", message);
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleMoveDown(item: MenuItem) {
    setBusyItemId(item.id);
    try {
      await moveMenuItemDown(restaurantId, item.id);
      reloadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "排序失敗，請稍後再試";
      showToast("error", message);
    } finally {
      setBusyItemId(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="菜單管理" />
        <div className="animate-pulse space-y-3 px-5 pt-4" aria-hidden>
          <div className="h-48 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="菜單管理" />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">
            {status === "not-found" ? "找不到餐廳" : "載入失敗"}
          </p>
          <Link
            href={`/restaurants/${restaurantId}`}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回餐廳
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <MenuPageHeader title="菜單管理" subtitle={restaurantName} />

      <section className="px-5 pt-3 pb-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <MenuManagerSection
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            onToast={handleImportToast}
          />
          <div className="border-t border-border">
            <MenuItemsImportPanel
              restaurantId={restaurantId}
              onToast={handleImportToast}
              showSummaryList={false}
            />
          </div>
        </div>
      </section>

      <section className="px-5 pb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-deep-brown">菜單品項</h2>
            <p className="text-xs text-text-secondary">共 {items.length} 項</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormMode("create");
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-caramel px-3 py-1.5 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            新增品項
          </button>
        </div>

        <MenuManageItemList
          items={items}
          busyItemId={busyItemId}
          onEdit={(item) => {
            setEditingItem(item);
            setFormMode("edit");
          }}
          onDelete={(item) => setDeleteTarget(item)}
          onMoveUp={(item) => {
            void handleMoveUp(item);
          }}
          onMoveDown={(item) => {
            void handleMoveDown(item);
          }}
        />
      </section>

      <MenuItemFormDialog
        open={formMode !== null}
        mode={formMode === "edit" ? "edit" : "create"}
        initialItem={editingItem}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setFormMode(null);
            setEditingItem(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-deep-brown/40 px-6"
          onClick={() => {
            if (!busyItemId) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-menu-item-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 text-center shadow-card"
          >
            <h2
              id="delete-menu-item-title"
              className="font-display text-base font-bold text-deep-brown"
            >
              刪除品項？
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cocoa">
              確定刪除「{deleteTarget.name}」？
              <br />
              此操作無法復原。
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                disabled={Boolean(busyItemId)}
                onClick={() => setDeleteTarget(null)}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                disabled={Boolean(busyItemId)}
                onClick={() => {
                  void handleConfirmDelete();
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-button disabled:opacity-60"
              >
                {busyItemId ? "刪除中…" : "刪除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
