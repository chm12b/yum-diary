"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ActiveOrderCard from "@/components/group-order/ActiveOrderCard";
import HistoryOrderCard from "@/components/group-order/HistoryOrderCard";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  ensureGroupOrderStatus,
  listActiveGroupOrders,
  listCompletedGroupOrders,
  listGroupOrderStats,
  type GroupOrder,
  type GroupOrderStats,
} from "@/src/services/group-order";
import { listRestaurantNamesByIds } from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

type HubData = {
  openOrders: GroupOrder[];
  closedOrders: GroupOrder[];
  historyOrders: GroupOrder[];
  restaurantNames: Map<string, string>;
  historyStats: Map<string, GroupOrderStats>;
};

const EMPTY_HUB: HubData = {
  openOrders: [],
  closedOrders: [],
  historyOrders: [],
  restaurantNames: new Map(),
  historyStats: new Map(),
};

function StartOrderHint() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-4 text-center">
      <p className="text-sm font-medium text-[#6E4F38]">想發起點餐？</p>
      <p className="mt-1 text-xs text-text-secondary">
        到餐廳頁點「發起點餐」，邀請大家一起點。
      </p>
      <Link
        href="/restaurants"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-caramel px-5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
      >
        去餐廳看看
      </Link>
    </div>
  );
}

export default function OrdersHubPage() {
  const router = useRouter();
  const { currentGroupId, loading: groupLoading, revision } =
    useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [data, setData] = useState<HubData>(EMPTY_HUB);
  const [loadedGroupId, setLoadedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (groupLoading || !currentGroupId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const [activeRows, historyRows] = await Promise.all([
          listActiveGroupOrders(currentGroupId),
          listCompletedGroupOrders(currentGroupId, { limit: 3 }),
        ]);
        if (cancelled) {
          return;
        }

        const resolvedActive = await Promise.all(
          activeRows.map((order) => ensureGroupOrderStatus(order)),
        );
        if (cancelled) {
          return;
        }

        const openOrders = resolvedActive
          .filter((order) => order.status === "OPEN")
          .sort(
            (a, b) =>
              new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime(),
          );
        const closedOrders = resolvedActive
          .filter((order) => order.status === "CLOSED")
          .sort(
            (a, b) =>
              new Date(b.closeAt).getTime() - new Date(a.closeAt).getTime(),
          );

        const allForNames = [...openOrders, ...closedOrders, ...historyRows];
        const restaurantIds = allForNames.map((order) => order.restaurantId);
        const [restaurantNames, historyStats] = await Promise.all([
          listRestaurantNamesByIds(restaurantIds),
          listGroupOrderStats(historyRows.map((order) => order.id)),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          openOrders,
          closedOrders,
          historyOrders: historyRows,
          restaurantNames,
          historyStats,
        });
        setLoadedGroupId(currentGroupId);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setData(EMPTY_HUB);
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

  const isEmpty =
    data.openOrders.length === 0 &&
    data.closedOrders.length === 0 &&
    data.historyOrders.length === 0;

  return (
    <div className="min-h-full bg-rice-white pb-10">
      <MenuPageHeader
        title="揪團點餐"
        subtitle="查看目前點餐與歷史紀錄。"
        onBack={() => router.push("/")}
      />

      {!currentGroupId && !groupLoading ? (
        <div className="px-5 pt-6 text-center">
          <p className="text-sm text-text-secondary">請先選擇或加入群組。</p>
        </div>
      ) : null}

      {waitingForGroupData || groupLoading ? (
        <div className="animate-pulse space-y-3 px-5 pt-4" aria-hidden>
          <div className="h-24 rounded-2xl bg-border/70" />
          <div className="h-24 rounded-2xl bg-border/60" />
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
        <div className="space-y-6 px-5 pt-3">
          {isEmpty ? (
            <div className="space-y-4 pt-4">
              <p className="text-center text-sm text-text-secondary">
                目前沒有任何共同點餐。
              </p>
              <StartOrderHint />
            </div>
          ) : (
            <>
              {data.openOrders.length > 0 ? (
                <section>
                  <h2 className="mb-2.5 text-sm font-bold text-[#6E4F38]">
                    🟢 點餐中
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {data.openOrders.map((order) => (
                      <li key={order.id}>
                        <ActiveOrderCard
                          orderId={order.id}
                          title={order.title}
                          restaurantName={
                            data.restaurantNames.get(order.restaurantId) ??
                            "未知餐廳"
                          }
                          closeAt={order.closeAt}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {data.closedOrders.length > 0 ? (
                <section>
                  <h2 className="mb-2.5 text-sm font-bold text-[#6E4F38]">
                    🔴 已截止，等待送單
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {data.closedOrders.map((order) => (
                      <li key={order.id}>
                        <ActiveOrderCard
                          orderId={order.id}
                          title={order.title}
                          restaurantName={
                            data.restaurantNames.get(order.restaurantId) ??
                            "未知餐廳"
                          }
                          closeAt={order.closeAt}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h2 className="mb-2.5 text-sm font-bold text-[#6E4F38]">
                  📜 點餐紀錄
                </h2>
                {data.historyOrders.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-8 text-center text-sm text-text-secondary">
                    還沒有完成的點餐紀錄。
                  </p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-2.5">
                      {data.historyOrders.map((order) => {
                        const stats =
                          data.historyStats.get(order.id) ?? {
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
                                data.restaurantNames.get(order.restaurantId) ??
                                "未知餐廳"
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
                    <div className="mt-3 flex justify-center">
                      <Link
                        href="/orders/history"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-caramel/50 bg-rice-white px-5 text-sm font-bold text-[#6E4F38] shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.98]"
                      >
                        查看更多
                      </Link>
                    </div>
                  </>
                )}
              </section>

              {data.openOrders.length === 0 &&
              data.closedOrders.length === 0 ? (
                <StartOrderHint />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
