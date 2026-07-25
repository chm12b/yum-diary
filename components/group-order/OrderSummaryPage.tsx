"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import MenuPageHeader from "@/components/menu/MenuPageHeader";
import {
  buildOrderSummaryCopyText,
  buildOrderSummaryGroups,
  listOrderItems,
  type GroupOrderItem,
} from "@/src/services/group-order-item";
import {
  ensureGroupOrderStatus,
  getGroupOrder,
  type GroupOrder,
} from "@/src/services/group-order";
import { getRestaurant } from "@/src/services/restaurant";

type OrderSummaryPageProps = {
  orderId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function OrderSummaryPage({ orderId }: OrderSummaryPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [restaurantName, setRestaurantName] = useState("—");
  const [restaurantPhone, setRestaurantPhone] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<GroupOrderItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2800);
  }

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

        const [restaurant, nextItems] = await Promise.all([
          getRestaurant(nextOrder.restaurantId),
          listOrderItems(nextOrder.id),
        ]);

        if (cancelled) {
          return;
        }

        setOrder(nextOrder);
        setRestaurantName(restaurant?.name?.trim() || "未知餐廳");
        setRestaurantPhone(restaurant?.phone?.trim() || null);
        setOrderItems(nextItems);
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

  const groups = useMemo(
    () => buildOrderSummaryGroups({ items: orderItems }),
    [orderItems],
  );

  const stats = useMemo(() => {
    const totalCups = groups.reduce(
      (sum, group) => sum + group.totalQuantity,
      0,
    );
    const totalAmount = groups.reduce(
      (sum, group) => sum + group.totalAmount,
      0,
    );
    const people = new Set(orderItems.map((item) => item.participantId)).size;
    return {
      people,
      totalCups,
      totalAmount,
    };
  }, [groups, orderItems]);

  function returnToOrder() {
    router.push(`/orders/${orderId}`);
  }

  async function handleCopy() {
    if (!order) {
      return;
    }

    const text = buildOrderSummaryCopyText({
      title: order.title,
      restaurantName,
      groups,
      totalCups: stats.totalCups,
      totalAmount: stats.totalAmount,
    });

    try {
      await navigator.clipboard.writeText(text);
      showToast("已複製訂單內容。");
    } catch {
      showToast("複製失敗，請稍後再試。");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-full bg-rice-white pb-10">
        <MenuPageHeader title="📋 訂單總覽" onBack={returnToOrder} />
        <div className="animate-pulse space-y-3 px-5 pt-3" aria-hidden>
          <div className="h-20 rounded-2xl bg-border/70" />
          <div className="h-40 rounded-2xl bg-border/60" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error" || !order) {
    return (
      <div className="min-h-full bg-rice-white pb-10">
        <MenuPageHeader title="📋 訂單總覽" onBack={returnToOrder} />
        <div className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">
            {status === "not-found" ? "找不到這場點餐" : "載入失敗"}
          </p>
          <Link
            href={`/orders/${orderId}`}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
          >
            回點餐頁
          </Link>
        </div>
      </div>
    );
  }

  const phoneHref = restaurantPhone
    ? `tel:${restaurantPhone.replace(/[^\d+]/g, "")}`
    : null;

  return (
    <div className="min-h-full bg-rice-white pb-28">
      <MenuPageHeader
        title="📋 訂單總覽"
        onBack={returnToOrder}
        rightAction={
          <button
            type="button"
            aria-label="複製訂單"
            onClick={() => {
              void handleCopy();
            }}
            className="flex h-9 items-center gap-1 rounded-full border border-border bg-rice-white/95 px-3 text-xs font-bold text-deep-brown shadow-soft"
          >
            <span aria-hidden>📄</span>
            複製
          </button>
        }
      />

      <div className="space-y-4 px-5 pt-3">
        <section className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-milk-tea/60 px-3 py-3 shadow-soft">
          <div className="text-center">
            <p className="text-[11px] text-text-secondary">👥 共 {stats.people} 人</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-secondary">
              🧋 共 {stats.totalCups} 項
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-soft-orange">
              💰 總金額：${stats.totalAmount}
            </p>
          </div>
        </section>

        {restaurantPhone ? (
          <p className="flex items-center justify-center gap-1.5 text-sm text-[#6E4F38]">
            <span aria-hidden>☎</span>
            <span className="font-medium tabular-nums">{restaurantPhone}</span>
          </p>
        ) : null}

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-12 text-center text-sm text-text-secondary">
            目前還沒有任何餐點。
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {groups.map((group) => (
              <li
                key={group.menuItemId}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[1.25rem] border border-border bg-rice-white px-4 py-3.5 shadow-soft"
              >
                <p className="min-w-0 truncate font-display text-[15px] font-bold text-[#6E4F38]">
                  {group.name}
                </p>
                <p className="shrink-0 text-[15px] font-medium tabular-nums text-[#6E4F38]">
                  ×{group.totalQuantity}
                </p>
                <p className="shrink-0 text-[15px] font-bold tabular-nums text-soft-orange">
                  ${group.totalAmount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {phoneHref ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-rice-white/95 px-5 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-app">
            <a
              href={phoneHref}
              className="flex h-14 w-full flex-col items-center justify-center rounded-full bg-caramel text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.99]"
            >
              <span className="text-[15px] font-bold">☎ 撥打店家</span>
              <span className="text-[11px] font-medium tabular-nums opacity-90">
                {restaurantPhone}
              </span>
            </a>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-caramel/30 bg-sakura-pink/80 px-4 py-3 text-center text-sm font-medium text-deep-brown shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
