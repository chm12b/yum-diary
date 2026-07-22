"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { getGroupOrder, type GroupOrder } from "@/src/services/group-order";
import { listProfileDisplayNames } from "@/src/services/profile/profile.service";
import { getRestaurant } from "@/src/services/restaurant";

type OrderDetailPageProps = {
  orderId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

const STATUS_LABEL: Record<GroupOrder["status"], string> = {
  OPEN: "開放中",
  CLOSED: "已截止",
  COMPLETED: "已完成",
};

function formatCloseAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-border px-4 py-3 last:border-b-0">
      <span className="shrink-0 text-xs text-text-secondary">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium text-deep-brown">
        {value}
      </span>
    </div>
  );
}

export default function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [restaurantName, setRestaurantName] = useState("—");
  const [hostName, setHostName] = useState("—");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextOrder = await getGroupOrder(orderId);
        if (cancelled) {
          return;
        }
        if (!nextOrder) {
          setOrder(null);
          setStatus("not-found");
          return;
        }

        setOrder(nextOrder);

        const [restaurant, names] = await Promise.all([
          getRestaurant(nextOrder.restaurantId),
          listProfileDisplayNames([nextOrder.createdBy]),
        ]);

        if (cancelled) {
          return;
        }

        setRestaurantName(restaurant?.name?.trim() || "未知餐廳");
        setHostName(names.get(nextOrder.createdBy) ?? "未知成員");
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

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="點餐活動" />
        <div className="animate-pulse px-5 pt-6" aria-hidden>
          <div className="h-40 rounded-2xl bg-border/80" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || !order) {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="點餐活動" />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">找不到這場點餐</p>
          <Link
            href="/"
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            回首頁
          </Link>
        </section>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="點餐活動" />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">載入點餐失敗</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <MenuPageHeader title="點餐活動" subtitle={order.title} />

      <section className="px-5 pt-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <InfoRow label="餐廳" value={restaurantName} />
          <InfoRow label="標題" value={order.title} />
          <InfoRow label="狀態" value={STATUS_LABEL[order.status]} />
          <InfoRow label="截止時間" value={formatCloseAt(order.closeAt)} />
          <InfoRow label="Host" value={hostName} />
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-2xl border border-dashed border-border bg-rice-white/80 px-4 py-10 text-center">
          <p className="text-sm font-medium text-cocoa">尚無點餐</p>
          <p className="mt-1 text-xs text-text-secondary">
            菜單與訂單功能將於後續開放
          </p>
        </div>
      </section>
    </div>
  );
}
