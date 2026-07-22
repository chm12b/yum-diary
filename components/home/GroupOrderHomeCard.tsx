"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import PaperCard from "@/components/ui/PaperCard";
import { homeAssets } from "@/src/lib/home-assets";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  listActiveGroupOrders,
  type GroupOrder,
} from "@/src/services/group-order";

type LoadStatus = "loading" | "ready" | "error";

function GroupOrderCardShell({
  subtitle,
  disabled,
}: {
  subtitle: string;
  disabled: boolean;
}) {
  return (
    <PaperCard
      className={`flex items-center gap-4 px-5 py-5 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <Image
        src={homeAssets.iconGroupOrder}
        alt=""
        width={80}
        height={48}
        aria-hidden
        className="h-12 w-[80px] shrink-0 object-contain -ml-[10px] -mr-[22px]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-text-primary">
          揪團點餐
        </span>
        <span className="mt-1 block whitespace-pre-line text-sm text-text-secondary">
          {subtitle}
        </span>
      </span>
      <Image
        src={homeAssets.entryArrow}
        alt=""
        width={28}
        height={28}
        aria-hidden
        className="h-7 w-7 shrink-0 object-contain"
      />
    </PaperCard>
  );
}

/**
 * Home reminder for active group orders.
 * Whole card is the only click target when active; no secondary button.
 */
export default function GroupOrderHomeCard() {
  const { currentGroupId, loading: groupLoading, revision } =
    useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loadedGroupId, setLoadedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (groupLoading || !currentGroupId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const rows = await listActiveGroupOrders(currentGroupId);
        if (cancelled) {
          return;
        }
        setOrders(rows);
        setLoadedGroupId(currentGroupId);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setOrders([]);
          setLoadedGroupId(currentGroupId);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentGroupId, groupLoading, revision]);

  if (groupLoading) {
    return (
      <div
        className="h-[88px] w-full animate-pulse rounded-[1.25rem] bg-border/80"
        aria-hidden
      />
    );
  }

  if (!currentGroupId) {
    return (
      <div aria-disabled="true">
        <GroupOrderCardShell
          disabled
          subtitle={"⚪ 目前沒有進行中的點餐。"}
        />
      </div>
    );
  }

  if (status === "loading" || loadedGroupId !== currentGroupId) {
    return (
      <div
        className="h-[88px] w-full animate-pulse rounded-[1.25rem] bg-border/80"
        aria-hidden
      />
    );
  }

  if (status === "error") {
    return (
      <div aria-disabled="true">
        <GroupOrderCardShell
          disabled
          subtitle={"⚪ 目前沒有進行中的點餐。"}
        />
      </div>
    );
  }

  const primaryOrder = orders[0] ?? null;

  if (!primaryOrder) {
    return (
      <div aria-disabled="true">
        <GroupOrderCardShell
          disabled
          subtitle={"⚪ 目前沒有進行中的點餐。"}
        />
      </div>
    );
  }

  return (
    <Link
      href={`/orders/${primaryOrder.id}`}
      className="block transition-transform active:scale-[0.98]"
    >
      <GroupOrderCardShell
        disabled={false}
        subtitle={"🟢  目前有進行中的點餐，\n快點進來看看！"}
      />
    </Link>
  );
}
