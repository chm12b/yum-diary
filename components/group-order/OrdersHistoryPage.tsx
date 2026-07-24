"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import HistoryOrderCard from "@/components/group-order/HistoryOrderCard";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  listCompletedGroupOrders,
  listGroupOrderStats,
  type GroupOrder,
  type GroupOrderStats,
} from "@/src/services/group-order";
import { listRestaurantNamesByIds } from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

export default function OrdersHistoryPage() {
  const router = useRouter();
  const { currentGroupId, loading: groupLoading, revision } =
    useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [statsById, setStatsById] = useState<Map<string, GroupOrderStats>>(
    () => new Map(),
  );
  const [loadedGroupId, setLoadedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (groupLoading || !currentGroupId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const rows = await listCompletedGroupOrders(currentGroupId);
        if (cancelled) {
          return;
        }

        const [names, stats] = await Promise.all([
          listRestaurantNamesByIds(rows.map((order) => order.restaurantId)),
          listGroupOrderStats(rows.map((order) => order.id)),
        ]);

        if (cancelled) {
          return;
        }

        setOrders(rows);
        setRestaurantNames(names);
        setStatsById(stats);
        setLoadedGroupId(currentGroupId);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setOrders([]);
          setRestaurantNames(new Map());
          setStatsById(new Map());
          setLoadedGroupId(currentGroupId);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentGroupId, groupLoading, revision]);

  const waitingForGroupData =
    Boolean(currentGroupId) &&
    (status === "loading" || loadedGroupId !== currentGroupId);

  return (
    <div className="min-h-full bg-rice-white pb-10">
      <MenuPageHeader
        title="📜 點餐紀錄"
        onBack={() => router.push("/orders")}
      />

      {!currentGroupId && !groupLoading ? (
        <div className="px-5 pt-6 text-center">
          <p className="text-sm text-text-secondary">請先選擇或加入群組。</p>
        </div>
      ) : null}

      {waitingForGroupData || groupLoading ? (
        <div className="animate-pulse space-y-3 px-5 pt-4" aria-hidden>
          <div className="h-28 rounded-2xl bg-border/70" />
          <div className="h-28 rounded-2xl bg-border/60" />
          <div className="h-28 rounded-2xl bg-border/50" />
        </div>
      ) : null}

      {status === "error" && loadedGroupId === currentGroupId ? (
        <div className="px-5 pt-10 text-center">
          <p className="text-sm font-medium text-cocoa">載入失敗</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
          >
            重新整理
          </button>
        </div>
      ) : null}

      {status === "ready" &&
      loadedGroupId === currentGroupId &&
      currentGroupId ? (
        <div className="px-5 pt-3">
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-12 text-center text-sm text-text-secondary">
              還沒有完成的點餐紀錄。
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {orders.map((order) => {
                const stats = statsById.get(order.id) ?? {
                  participantCount: 0,
                  itemCount: 0,
                  totalAmount: 0,
                };
                return (
                  <li key={order.id}>
                    <HistoryOrderCard
                      orderId={order.id}
                      title={order.title}
                      restaurantName={
                        restaurantNames.get(order.restaurantId) ?? "未知餐廳"
                      }
                      completedAt={order.completedAt}
                      participantCount={stats.participantCount}
                      itemCount={stats.itemCount}
                      totalAmount={stats.totalAmount}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
