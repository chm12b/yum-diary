"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import ExtendDeadlineDialog from "@/components/group-order/ExtendDeadlineDialog";
import GroupOrderSummaryCard, {
  GroupOrderPageHeader,
} from "@/components/group-order/GroupOrderSummaryCard";
import ParticipantOrderCard from "@/components/group-order/ParticipantOrderCard";
import { useAuth } from "@/src/hooks/useAuth";
import {
  deleteOrderItem,
  lineTotal,
  listOrderItems,
  updateOrderItem,
  type GroupOrderItem,
} from "@/src/services/group-order-item";
import {
  ensureGroupOrderDeadlineClosed,
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
          setOrder(null);
          setParticipants([]);
          setOrderItems([]);
          setStatus("not-found");
          return;
        }

        const nextOrder = await ensureGroupOrderDeadlineClosed(loaded);
        if (cancelled) {
          return;
        }

        const [restaurant, nextParticipants, nextItems] = await Promise.all([
          getRestaurant(nextOrder.restaurantId),
          listParticipants(nextOrder.id),
          listOrderItems(nextOrder.id),
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

  async function refreshParticipantsAndItems(groupOrderId: string) {
    const [nextParticipants, nextItems] = await Promise.all([
      listParticipants(groupOrderId),
      listOrderItems(groupOrderId),
    ]);
    setParticipants(nextParticipants);
    setOrderItems(nextItems);

    const profileIds = [
      ...(order ? [order.createdBy] : []),
      ...nextParticipants.map((p) => p.userId),
    ];
    const names = await listProfileDisplayNames(profileIds);
    setDisplayNames(names);
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
      await refreshParticipantsAndItems(order.id);
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
      showToast(`已延長點餐時間 ${minutes} 分鐘。`);
    } finally {
      setExtending(false);
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
  const showHostClosedActions = isHost && order.status === "CLOSED";

  return (
    <div className="min-h-full bg-rice-white pb-10">
      <GroupOrderPageHeader
        onShare={() => {
          if (typeof navigator !== "undefined" && navigator.share) {
            void navigator.share({
              title: order.title,
              url: window.location.href,
            });
            return;
          }
          void navigator.clipboard?.writeText(window.location.href);
        }}
      />

      <div className="px-5">
        <GroupOrderSummaryCard
          title={order.title}
          restaurantName={restaurantName}
          status={order.status}
          deadlineLabel={formatDeadlineLabel(order.closeAt)}
          participantCount={stats.participantCount}
          itemCount={stats.itemCount}
          estimatedTotal={stats.estimatedTotal}
        />

        {showHostClosedActions ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setExtendDialogOpen(true)}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-caramel/50 bg-rice-white text-sm font-bold text-[#6E4F38] shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.99]"
            >
              延長時間
            </button>
            <button
              type="button"
              onClick={() => {
                // Complete-order flow — later sprint
              }}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.99]"
            >
              完成訂單
            </button>
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
            joining={participant.isCurrentUser && joining}
            quantityBusyId={
              participant.isCurrentUser ? quantityBusyId : null
            }
            onQuantityChange={
              participant.isCurrentUser && participant.hasJoined
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
