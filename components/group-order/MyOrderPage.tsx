"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MenuBrowseList from "@/components/menu/MenuBrowseList";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import MenuSearchBar from "@/components/menu/MenuSearchBar";
import {
  createOrderItem,
  deleteOrderItem,
  listMyOrderItems,
  updateOrderItem,
  type GroupOrderItem,
} from "@/src/services/group-order-item";
import {
  ensureGroupOrderStatus,
  getGroupOrder,
  type GroupOrder,
} from "@/src/services/group-order";
import {
  createParticipant,
  getMyParticipant,
} from "@/src/services/group-order-participant";
import { listMenuItems, type MenuItem } from "@/src/services/menu-item";
import { getRestaurant } from "@/src/services/restaurant";

type MyOrderPageProps = {
  orderId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error" | "closed";

/** Local draft: menuItemId → quantity (>= 1). Missing key = not selected. */
type DraftQuantities = Record<string, number>;

function toDraftMap(items: GroupOrderItem[]): DraftQuantities {
  const draft: DraftQuantities = {};
  for (const item of items) {
    draft[item.menuItemId] = item.quantity;
  }
  return draft;
}

function isDraftDirty(
  baseline: GroupOrderItem[],
  draft: DraftQuantities,
): boolean {
  const baselineMap = new Map(
    baseline.map((item) => [item.menuItemId, item.quantity]),
  );
  const draftIds = Object.keys(draft);

  for (const menuItemId of draftIds) {
    const qty = draft[menuItemId] ?? 0;
    const base = baselineMap.get(menuItemId) ?? 0;
    if (qty !== base) {
      return true;
    }
  }

  for (const item of baseline) {
    if ((draft[item.menuItemId] ?? 0) !== item.quantity) {
      return true;
    }
  }

  return false;
}

function UnsavedLeaveDialog({
  open,
  onContinue,
  onDiscard,
}: {
  open: boolean;
  onContinue: () => void;
  onDiscard: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onContinue();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onContinue]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-brown/40 px-6"
      onClick={onContinue}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-leave-title"
        aria-describedby="unsaved-leave-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 shadow-card"
      >
        <h2
          id="unsaved-leave-title"
          className="text-center font-display text-base font-bold text-deep-brown"
        >
          尚未儲存變更
        </h2>
        <p
          id="unsaved-leave-desc"
          className="mt-3 text-center text-sm text-text-secondary"
        >
          確定要離開嗎？
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-rice-white text-sm font-bold text-[#6E4F38] shadow-soft"
          >
            繼續編輯
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button"
          >
            放棄變更
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyOrderPage({ orderId }: MyOrderPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [baselineItems, setBaselineItems] = useState<GroupOrderItem[]>([]);
  const [draftQty, setDraftQty] = useState<DraftQuantities>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const loaded = await getGroupOrder(orderId);
        if (cancelled) {
          return;
        }
        if (!loaded) {
          setStatus("not-found");
          return;
        }

        const nextOrder = await ensureGroupOrderStatus(loaded);
        if (cancelled) {
          return;
        }

        if (nextOrder.status !== "OPEN") {
          setOrder(nextOrder);
          setStatus("closed");
          return;
        }

        const existing = await getMyParticipant(nextOrder.id);
        if (!existing) {
          await createParticipant({
            groupOrderId: nextOrder.id,
          });
        }

        if (cancelled) {
          return;
        }

        const [restaurant, items, orderItems] = await Promise.all([
          getRestaurant(nextOrder.restaurantId),
          listMenuItems(nextOrder.restaurantId),
          listMyOrderItems(nextOrder.id),
        ]);

        if (cancelled) {
          return;
        }

        setOrder(nextOrder);
        setRestaurantName(restaurant?.name?.trim() || "未知餐廳");
        setMenuItems(items);
        setBaselineItems(orderItems);
        setDraftQty(toDraftMap(orderItems));
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
  }, [orderId]);

  const dirty = useMemo(
    () => isDraftDirty(baselineItems, draftQty),
    [baselineItems, draftQty],
  );

  const mySubtotal = useMemo(() => {
    let sum = 0;
    for (const menuItem of menuItems) {
      const qty = draftQty[menuItem.id] ?? 0;
      if (qty <= 0) {
        continue;
      }
      sum += (menuItem.price ?? 0) * qty;
    }
    return sum;
  }, [menuItems, draftQty]);

  const selectedCount = useMemo(
    () =>
      Object.values(draftQty).reduce(
        (sum, qty) => sum + (qty > 0 ? qty : 0),
        0,
      ),
    [draftQty],
  );

  function returnToOrder() {
    router.push(`/orders/${orderId}`);
  }

  function handleBack() {
    if (dirty) {
      setLeaveDialogOpen(true);
      return;
    }
    returnToOrder();
  }

  function handleCancel() {
    returnToOrder();
  }

  function handleIncrement(menuItem: MenuItem) {
    if (syncing) {
      return;
    }
    setActionError(null);
    setDraftQty((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] ?? 0) + 1,
    }));
  }

  function handleDecrement(menuItem: MenuItem) {
    if (syncing) {
      return;
    }
    setActionError(null);
    setDraftQty((prev) => {
      const current = prev[menuItem.id] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[menuItem.id];
        return next;
      }
      return { ...prev, [menuItem.id]: current - 1 };
    });
  }

  async function handleComplete() {
    if (!order || !dirty || syncing) {
      return;
    }

    setSyncing(true);
    setActionError(null);
    try {
      const baselineByMenu = new Map(
        baselineItems.map((item) => [item.menuItemId, item]),
      );

      for (const [menuItemId, quantity] of Object.entries(draftQty)) {
        if (quantity <= 0) {
          continue;
        }
        const existing = baselineByMenu.get(menuItemId);
        if (!existing) {
          await createOrderItem({
            groupOrderId: order.id,
            menuItemId,
            quantity,
            note: null,
          });
        } else if (existing.quantity !== quantity) {
          await updateOrderItem({
            id: existing.id,
            quantity,
          });
        }
      }

      for (const item of baselineItems) {
        const draft = draftQty[item.menuItemId] ?? 0;
        if (draft <= 0) {
          await deleteOrderItem({ id: item.id });
        }
      }

      returnToOrder();
    } catch {
      setActionError("儲存失敗，請再試一次");
      setSyncing(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="新增餐點" onBack={handleBack} />
        <div className="animate-pulse space-y-3 px-5 pt-4" aria-hidden>
          <div className="h-9 w-full rounded-full bg-border/70" />
          <div className="h-8 w-full rounded-full bg-border/60" />
          <div className="h-40 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="新增餐點" onBack={returnToOrder} />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">
            {status === "not-found" ? "找不到這場點餐" : "載入失敗"}
          </p>
          <button
            type="button"
            onClick={returnToOrder}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回點餐頁
          </button>
        </div>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="新增餐點" onBack={returnToOrder} />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">此點餐已截止，無法修改餐點</p>
          <button
            type="button"
            onClick={returnToOrder}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回點餐頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-28">
      <MenuPageHeader
        title="新增餐點"
        subtitle={restaurantName}
        onBack={handleBack}
      />

      <div className="space-y-3 px-5 pt-3">
        <MenuSearchBar value={searchQuery} onChange={setSearchQuery} />

        {actionError ? (
          <p className="text-center text-sm text-soft-orange" role="alert">
            {actionError}
          </p>
        ) : null}

        <MenuBrowseList
          items={menuItems}
          searchQuery={searchQuery}
          getQuantity={(item) => draftQty[item.id] ?? 0}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          controlsDisabled={syncing}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-rice-white/95 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-text-secondary">已選 {selectedCount} 項</p>
            <p className="font-display font-bold text-soft-orange">
              小計 $ {mySubtotal}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={syncing}
              className="flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-rice-white text-[15px] font-bold text-[#6E4F38] shadow-soft disabled:opacity-55"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                void handleComplete();
              }}
              disabled={!dirty || syncing}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-caramel text-[15px] font-bold text-rice-white shadow-button disabled:cursor-not-allowed disabled:bg-soft-gray disabled:shadow-none"
            >
              {syncing ? "儲存中…" : "完成"}
            </button>
          </div>
        </div>
      </div>

      <UnsavedLeaveDialog
        open={leaveDialogOpen}
        onContinue={() => setLeaveDialogOpen(false)}
        onDiscard={() => {
          setLeaveDialogOpen(false);
          returnToOrder();
        }}
      />
    </div>
  );
}
