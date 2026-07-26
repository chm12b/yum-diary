"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import CompleteOrderDialog from "@/components/group-order/CompleteOrderDialog";
import ExtendDeadlineDialog from "@/components/group-order/ExtendDeadlineDialog";
import GroupOrderSummaryCard, {
  GroupOrderPageHeader,
} from "@/components/group-order/GroupOrderSummaryCard";
import ParticipantOrderCard from "@/components/group-order/ParticipantOrderCard";
import StopOrderingDialog from "@/components/group-order/StopOrderingDialog";
import { useAuth } from "@/src/hooks/useAuth";
import {
  buildGroupOrderShareMessage,
  buildGroupOrderShareUrl,
} from "@/src/lib/app-url";
import {
  deleteOrderItem,
  lineTotal,
  listOrderItems,
  updateOrderItem,
  type GroupOrderItem,
} from "@/src/services/group-order-item";
import {
  closeGroupOrder,
  completeGroupOrder,
  ensureGroupOrderStatus,
  extendGroupOrderDeadline,
  getGroupOrder,
  type ExtendDeadlineMinutes,
  type GroupOrder,
} from "@/src/services/group-order";
import {
  createParticipant,
  listParticipants,
  type GroupOrderParticipant,
} from "@/src/services/group-order-participant";
import { listProfileDisplayNames } from "@/src/services/profile/profile.service";
import { getMyRecordByGroupOrderId } from "@/src/services/record";
import { getRestaurant } from "@/src/services/restaurant";

type OrderDetailPageProps = {
  orderId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

type DisplayLineItem = {
  id: string;
  name: string;
  note: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type DisplayParticipant = {
  userId: string;
  participantId: string | null;
  displayName: string;
  isHost: boolean;
  isCurrentUser: boolean;
  hasJoined: boolean;
  items: DisplayLineItem[];
};

function formatDeadlineTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDeadlineLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const now = new Date();
  const time = new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return `今天 ${time}`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  if (isTomorrow) {
    return `明天 ${time}`;
  }

  const day = new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
  }).format(date);

  return `${day} ${time}`;
}

function toDisplayLineItem(item: GroupOrderItem): DisplayLineItem {
  return {
    id: item.id,
    name: item.menuItemName,
    note: item.note,
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? 0,
    lineTotal: lineTotal(item),
  };
}

function buildDisplayParticipants(input: {
  order: GroupOrder;
  participants: GroupOrderParticipant[];
  orderItems: GroupOrderItem[];
  currentUserId: string | null;
  names: Map<string, string>;
}): DisplayParticipant[] {
  const { order, participants, orderItems, currentUserId, names } = input;

  const itemsByParticipant = new Map<string, DisplayLineItem[]>();
  for (const item of orderItems) {
    const list = itemsByParticipant.get(item.participantId) ?? [];
    list.push(toDisplayLineItem(item));
    itemsByParticipant.set(item.participantId, list);
  }

  // participants is already ordered by joined_at ASC.
  const cards: DisplayParticipant[] = participants.map((participant) => {
    const isHost = participant.userId === order.createdBy;
    const isCurrentUser =
      currentUserId != null && participant.userId === currentUserId;

    return {
      userId: participant.userId,
      participantId: participant.id,
      displayName: names.get(participant.userId) ?? "未知成員",
      isHost,
      isCurrentUser,
      hasJoined: true,
      items: itemsByParticipant.get(participant.id) ?? [],
    };
  });

  const me = cards.find((card) => card.isCurrentUser);
  // Hide other participants who have no order items (participant row kept in DB).
  const others = cards.filter(
    (card) => !card.isCurrentUser && card.items.length > 0,
  );

  if (currentUserId && !me) {
    return [
      {
        userId: currentUserId,
        participantId: null,
        displayName: names.get(currentUserId) ?? "我",
        isHost: currentUserId === order.createdBy,
        isCurrentUser: true,
        hasJoined: false,
        items: [],
      },
      ...others,
    ];
  }

  if (me) {
    return [me, ...others];
  }

  return others;
}

export default function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [restaurantName, setRestaurantName] = useState("—");
  const [participants, setParticipants] = useState<GroupOrderParticipant[]>(
    [],
  );
  const [orderItems, setOrderItems] = useState<GroupOrderItem[]>([]);
  const [displayNames, setDisplayNames] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [quantityBusyId, setQuantityBusyId] = useState<string | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extending, setExtending] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [linkedRecordId, setLinkedRecordId] = useState<string | null>(null);
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
          setOrder(null);
          setParticipants([]);
          setOrderItems([]);
          setStatus("not-found");
          return;
        }

        const nextOrder = await ensureGroupOrderStatus(loaded);
        if (cancelled) {
          return;
        }

        const [restaurant, nextParticipants, nextItems, linkedRecord] =
          await Promise.all([
            getRestaurant(nextOrder.restaurantId),
            listParticipants(nextOrder.id),
            listOrderItems(nextOrder.id),
            nextOrder.status === "COMPLETED"
              ? getMyRecordByGroupOrderId(nextOrder.id)
              : Promise.resolve(null),
          ]);

        if (cancelled) {
          return;
        }

        const profileIds = [
          nextOrder.createdBy,
          ...nextParticipants.map((p) => p.userId),
        ];
        const names = await listProfileDisplayNames(profileIds);

        if (cancelled) {
          return;
        }

        setOrder(nextOrder);
        setRestaurantName(restaurant?.name?.trim() || "未知餐廳");
        setParticipants(nextParticipants);
        setOrderItems(nextItems);
        setDisplayNames(names);
        setLinkedRecordId(linkedRecord?.id ?? null);
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

  const displayParticipants = useMemo(() => {
    if (!order) {
      return [];
    }
    return buildDisplayParticipants({
      order,
      participants,
      orderItems,
      currentUserId: user?.id ?? null,
      names: displayNames,
    });
  }, [order, participants, orderItems, user?.id, displayNames]);

  const stats = useMemo(() => {
    const itemCount = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const estimatedTotal = orderItems.reduce(
      (sum, item) => sum + lineTotal(item),
      0,
    );
    return {
      participantCount: participants.length,
      itemCount,
      estimatedTotal,
    };
  }, [orderItems, participants.length]);

  const myOrderedQuantity = useMemo(() => {
    const me = displayParticipants.find((card) => card.isCurrentUser);
    if (!me) {
      return 0;
    }
    return me.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [displayParticipants]);

  async function refreshParticipantsAndItems(
    groupOrderId: string,
    createdBy: string,
  ) {
    const [nextParticipants, nextItems] = await Promise.all([
      listParticipants(groupOrderId),
      listOrderItems(groupOrderId),
    ]);
    setParticipants(nextParticipants);
    setOrderItems(nextItems);

    const profileIds = [
      createdBy,
      ...nextParticipants.map((p) => p.userId),
    ];
    const names = await listProfileDisplayNames(profileIds);
    setDisplayNames(names);
  }

  async function handleRefresh() {
    if (!order || refreshing) {
      return;
    }

    setRefreshing(true);
    setJoinError(null);
    try {
      const loaded = await getGroupOrder(order.id);
      if (!loaded) {
        setStatus("not-found");
        return;
      }

      const nextOrder = await ensureGroupOrderStatus(loaded);
      setOrder(nextOrder);
      await refreshParticipantsAndItems(nextOrder.id, nextOrder.createdBy);
      if (nextOrder.status === "COMPLETED") {
        const linked = await getMyRecordByGroupOrderId(nextOrder.id);
        setLinkedRecordId(linked?.id ?? null);
      } else {
        setLinkedRecordId(null);
      }
      showToast("已更新點餐內容。");
    } catch {
      showToast("更新失敗，請再試一次。");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleJoinOrEdit(hasJoined: boolean) {
    if (!order || order.status !== "OPEN") {
      return;
    }

    if (hasJoined) {
      router.push(`/orders/${order.id}/my-order`);
      return;
    }

    setJoining(true);
    setJoinError(null);
    try {
      await createParticipant({ groupOrderId: order.id });
      router.push(`/orders/${order.id}/my-order`);
    } catch {
      setJoinError("加入點餐失敗，請再試一次");
    } finally {
      setJoining(false);
    }
  }

  async function handleQuantityChange(itemId: string, delta: 1 | -1) {
    if (!order || order.status !== "OPEN" || quantityBusyId) {
      return;
    }

    const current = orderItems.find((item) => item.id === itemId);
    if (!current) {
      return;
    }

    setQuantityBusyId(itemId);
    setJoinError(null);
    try {
      const nextQuantity = current.quantity + delta;
      if (nextQuantity <= 0) {
        await deleteOrderItem({ id: itemId });
        setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
        return;
      }

      const updated = await updateOrderItem({
        id: itemId,
        quantity: nextQuantity,
      });
      setOrderItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated : item)),
      );
    } catch {
      setJoinError("更新數量失敗，請再試一次");
    } finally {
      setQuantityBusyId(null);
    }
  }

  async function handleExtendDeadline(minutes: ExtendDeadlineMinutes) {
    if (!order || extending) {
      return;
    }

    setExtending(true);
    try {
      const updated = await extendGroupOrderDeadline({
        id: order.id,
        minutes,
      });
      setOrder(updated);
      setExtendDialogOpen(false);
      showToast(`已重新開放點餐 ${minutes} 分鐘。`);
    } finally {
      setExtending(false);
    }
  }

  async function handleStopOrdering() {
    if (!order || stopping) {
      return;
    }

    setStopping(true);
    setJoinError(null);
    try {
      const updated = await closeGroupOrder({ id: order.id });
      setOrder(updated);
      setStopDialogOpen(false);
      showToast("已停止點單。");
    } catch {
      setJoinError("停止點單失敗，請再試一次");
      setStopDialogOpen(false);
    } finally {
      setStopping(false);
    }
  }

  async function handleCompleteOrder() {
    if (!order || completing) {
      return;
    }

    setCompleting(true);
    setJoinError(null);
    try {
      const updated = await completeGroupOrder({ id: order.id });
      setOrder(updated);
      setCompleteDialogOpen(false);
      showToast("訂單已完成。");
    } catch {
      setJoinError("完成訂單失敗，請再試一次");
      setCompleteDialogOpen(false);
    } finally {
      setCompleting(false);
    }
  }

  async function handleShare() {
    if (!order) {
      return;
    }

    const url = buildGroupOrderShareUrl(order.id);
    const text = buildGroupOrderShareMessage({
      restaurantName,
      title: order.title,
      deadlineTime: formatDeadlineTime(order.closeAt),
      url,
    });

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "🍽 一起來點餐！",
          text,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast("已複製點餐連結。");
    } catch {
      showToast("複製失敗，請稍後再試。");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-full bg-rice-white pb-10">
        <GroupOrderPageHeader />
        <div className="animate-pulse space-y-4 px-5 pt-2" aria-hidden>
          <div className="h-44 rounded-[1.5rem] bg-border/70" />
          <div className="h-40 rounded-[1.35rem] bg-border/60" />
          <div className="h-32 rounded-[1.35rem] bg-border/50" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || !order) {
    return (
      <div className="min-h-full bg-rice-white pb-10">
        <GroupOrderPageHeader />
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
      <div className="min-h-full bg-rice-white pb-10">
        <GroupOrderPageHeader />
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

  const canEditOrder = order.status === "OPEN";
  const isHost = user?.id != null && user.id === order.createdBy;
  const showHostOpenActions = isHost && order.status === "OPEN";
  const showHostClosedActions = isHost && order.status === "CLOSED";

  const showDiaryWriteCta =
    order.status === "COMPLETED" &&
    myOrderedQuantity > 0 &&
    linkedRecordId == null;
  const showDiaryViewCta =
    order.status === "COMPLETED" && linkedRecordId != null;

  return (
    <div className="min-h-full bg-rice-white pb-10">
      <GroupOrderPageHeader
        onShare={() => void handleShare()}
        onRefresh={() => {
          void handleRefresh();
        }}
        refreshing={refreshing}
      />

      <div className="px-5">
        <GroupOrderSummaryCard
          title={order.title}
          restaurantId={order.restaurantId}
          restaurantName={restaurantName}
          status={order.status}
          deadlineLabel={formatDeadlineLabel(order.closeAt)}
          participantCount={stats.participantCount}
          itemCount={stats.itemCount}
          estimatedTotal={stats.estimatedTotal}
          onOpenOverview={() => {
            router.push(`/orders/${order.id}/summary`);
          }}
        />

        {showHostOpenActions ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setStopDialogOpen(true)}
              className="flex h-11 w-full items-center justify-center rounded-full border border-status-closed-fg/40 bg-status-closed-bg text-sm font-bold text-status-closed-fg shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.99]"
            >
              停止點單
            </button>
          </div>
        ) : null}

        {showHostClosedActions ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setExtendDialogOpen(true)}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-caramel/50 bg-rice-white text-sm font-bold text-[#6E4F38] shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.99]"
            >
              重新開放點餐
            </button>
            <button
              type="button"
              onClick={() => setCompleteDialogOpen(true)}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.99]"
            >
              完成訂單
            </button>
          </div>
        ) : null}

        {showDiaryWriteCta ? (
          <div className="mt-3">
            <Link
              href={`/orders/${order.id}/diary/new`}
              className="flex h-11 w-full items-center justify-center rounded-full bg-sakura-pink text-sm font-bold text-deep-brown shadow-pink-button transition-transform active:scale-[0.98]"
            >
              📔 寫美食日記
            </Link>
          </div>
        ) : null}

        {showDiaryViewCta && linkedRecordId ? (
          <div className="mt-3">
            <Link
              href={`/records/${linkedRecordId}`}
              className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-rice-white text-sm font-bold text-deep-brown shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.98]"
            >
              📖 查看美食日記
            </Link>
          </div>
        ) : null}
      </div>

      <section className="mt-4 flex flex-col gap-3 px-5 pb-6">
        {joinError ? (
          <p className="text-center text-sm text-soft-orange" role="alert">
            {joinError}
          </p>
        ) : null}
        {displayParticipants.map((participant) => (
          <ParticipantOrderCard
            key={participant.userId}
            displayName={participant.displayName}
            isHost={participant.isHost}
            isCurrentUser={participant.isCurrentUser}
            hasJoined={participant.hasJoined}
            items={participant.items}
            editDisabled={!canEditOrder}
            hideEditCta={!canEditOrder}
            joining={participant.isCurrentUser && joining}
            quantityBusyId={
              participant.isCurrentUser ? quantityBusyId : null
            }
            onQuantityChange={
              participant.isCurrentUser && participant.hasJoined && canEditOrder
                ? (itemId, delta) => {
                    void handleQuantityChange(itemId, delta);
                  }
                : undefined
            }
            onEditOrder={() => {
              void handleJoinOrEdit(participant.hasJoined);
            }}
          />
        ))}
      </section>

      <StopOrderingDialog
        open={stopDialogOpen}
        submitting={stopping}
        onClose={() => {
          if (!stopping) {
            setStopDialogOpen(false);
          }
        }}
        onConfirm={handleStopOrdering}
      />

      <ExtendDeadlineDialog
        open={extendDialogOpen}
        submitting={extending}
        onClose={() => {
          if (!extending) {
            setExtendDialogOpen(false);
          }
        }}
        onConfirm={handleExtendDeadline}
      />

      <CompleteOrderDialog
        open={completeDialogOpen}
        submitting={completing}
        onClose={() => {
          if (!completing) {
            setCompleteDialogOpen(false);
          }
        }}
        onConfirm={handleCompleteOrder}
      />

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
