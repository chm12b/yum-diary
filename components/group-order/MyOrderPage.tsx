"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import MenuBrowseList from "@/components/menu/MenuBrowseList";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import MenuSearchBar from "@/components/menu/MenuSearchBar";
import {
  createOrderItem,
  deleteOrderItem,
  listMyOrderItems,
  lineTotal,
  updateOrderItem,
  type GroupOrderItem,
} from "@/src/services/group-order-item";
import { getGroupOrder, type GroupOrder } from "@/src/services/group-order";
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

export default function MyOrderPage({ orderId }: MyOrderPageProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [myItems, setMyItems] = useState<GroupOrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [busyMenuItemId, setBusyMenuItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextOrder = await getGroupOrder(orderId);
        if (cancelled) {
          return;
        }
        if (!nextOrder) {
          setStatus("not-found");
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
        setMyItems(orderItems);
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

  const quantityByMenuItemId = useMemo(() => {
    const map = new Map<string, GroupOrderItem>();
    for (const item of myItems) {
      map.set(item.menuItemId, item);
    }
    return map;
  }, [myItems]);

  const mySubtotal = useMemo(
    () => myItems.reduce((sum, item) => sum + lineTotal(item), 0),
    [myItems],
  );

  function upsertLocalItem(next: GroupOrderItem) {
    setMyItems((prev) => {
      const index = prev.findIndex((item) => item.id === next.id);
      if (index === -1) {
        const byMenu = prev.findIndex(
          (item) => item.menuItemId === next.menuItemId,
        );
        if (byMenu === -1) {
          return [...prev, next];
        }
        const copy = [...prev];
        copy[byMenu] = next;
        return copy;
      }
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
  }

  async function handleIncrement(menuItem: MenuItem) {
    if (!order || busyMenuItemId) {
      return;
    }

    setBusyMenuItemId(menuItem.id);
    setActionError(null);
    try {
      const next = await createOrderItem({
        groupOrderId: order.id,
        menuItemId: menuItem.id,
        quantity: 1,
        note: null,
      });
      upsertLocalItem(next);
    } catch {
      setActionError("更新數量失敗，請再試一次");
    } finally {
      setBusyMenuItemId(null);
    }
  }

  async function handleDecrement(menuItem: MenuItem) {
    if (!order || busyMenuItemId) {
      return;
    }

    const current = quantityByMenuItemId.get(menuItem.id);
    if (!current) {
      return;
    }

    setBusyMenuItemId(menuItem.id);
    setActionError(null);
    try {
      const nextQuantity = current.quantity - 1;
      if (nextQuantity <= 0) {
        await deleteOrderItem({ id: current.id });
        setMyItems((prev) => prev.filter((item) => item.id !== current.id));
        return;
      }

      const updated = await updateOrderItem({
        id: current.id,
        quantity: nextQuantity,
      });
      upsertLocalItem(updated);
    } catch {
      setActionError("更新數量失敗，請再試一次");
    } finally {
      setBusyMenuItemId(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="新增餐點" />
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
        <MenuPageHeader title="新增餐點" />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">
            {status === "not-found" ? "找不到這場點餐" : "載入失敗"}
          </p>
          <Link
            href={`/orders/${orderId}`}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回點餐頁
          </Link>
        </div>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="新增餐點" />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">此點餐已截止，無法修改餐點</p>
          <Link
            href={`/orders/${orderId}`}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回點餐頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-28">
      <MenuPageHeader title="新增餐點" subtitle={restaurantName} />

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
          getQuantity={(item) =>
            quantityByMenuItemId.get(item.id)?.quantity ?? 0
          }
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          busyMenuItemId={busyMenuItemId}
          controlsDisabled={Boolean(busyMenuItemId)}
        />
      </div>

      {myItems.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-rice-white/95 px-5 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-app items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              已選 {myItems.reduce((sum, item) => sum + item.quantity, 0)} 項
            </p>
            <p className="font-display text-base font-bold text-soft-orange">
              小計 $ {mySubtotal}
            </p>
            <Link
              href={`/orders/${orderId}`}
              className="rounded-full bg-caramel px-4 py-2 text-sm font-bold text-rice-white shadow-button"
            >
              完成
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
