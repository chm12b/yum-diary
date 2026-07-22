"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listMenuItems } from "@/src/services/menu-item";

type EditMenuEntrySectionProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "error";

/** Edit Restaurant — entry to Menu Management (no item list / import). */
export default function EditMenuEntrySection({
  restaurantId,
}: EditMenuEntrySectionProps) {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const rows = await listMenuItems(restaurantId);
        if (cancelled) {
          return;
        }
        setCount(rows.length);
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

  return (
    <div className="space-y-1 px-4 py-3.5">
      <h3 className="text-sm font-bold text-deep-brown">🍽 菜單管理</h3>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-cream-bg/40 px-3 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-deep-brown">菜單品項</p>
          <p className="mt-0.5 text-[10px] text-text-secondary">
            {status === "loading"
              ? "載入中…"
              : status === "error"
                ? "無法載入數量"
                : count === 0
                  ? "尚未新增品項"
                  : `共 ${count} 項`}
          </p>
        </div>
        <Link
          href={`/restaurants/${restaurantId}/menu/edit`}
          className="shrink-0 rounded-full bg-caramel px-3.5 py-1.5 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          管理菜單
        </Link>
      </div>
    </div>
  );
}
