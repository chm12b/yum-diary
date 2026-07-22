"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import SectionHeading from "@/components/restaurants/detail/SectionHeading";
import { homeAssets } from "@/src/lib/home-assets";
import { listMenuItems } from "@/src/services/menu-item";

type MenuEntrySectionProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "error";

/** Restaurant Detail — view entry to Menu Browse (no item list). */
export default function MenuEntrySection({
  restaurantId,
}: MenuEntrySectionProps) {
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
    <section className="px-5 pt-5">
      <SectionHeading
        iconSrc={homeAssets.storeMenu}
        title="📖 菜單"
        iconSize={50}
        className="-mt-[10px] -mb-[2px] flex items-center gap-2"
      />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-rice-white px-4 py-4 shadow-soft">
        <div className="min-w-0">
          <p className="text-sm font-medium text-deep-brown">菜單品項</p>
          <p className="mt-0.5 text-xs text-text-secondary">
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
          href={`/restaurants/${restaurantId}/menu`}
          className="shrink-0 rounded-full bg-caramel px-4 py-2 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          查看菜單
        </Link>
      </div>
    </section>
  );
}
