"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MenuBrowseList from "@/components/menu/MenuBrowseList";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { getRestaurant } from "@/src/services/restaurant";
import { listMenuItems, type MenuItem } from "@/src/services/menu-item";

type MenuBrowsePageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function MenuBrowsePage({ restaurantId }: MenuBrowsePageProps) {
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [restaurant, menuItems] = await Promise.all([
          getRestaurant(restaurantId),
          listMenuItems(restaurantId),
        ]);

        if (cancelled) {
          return;
        }

        if (!restaurant) {
          setStatus("not-found");
          return;
        }

        setRestaurantName(restaurant.name);
        setItems(menuItems);
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

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="菜單" />
        <div className="animate-pulse space-y-3 px-5 pt-4" aria-hidden>
          <div className="h-9 w-full rounded-full bg-border/70" />
          <div className="h-40 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MenuPageHeader title="菜單" />
        <div className="flex flex-col items-center gap-3 px-5 pt-10 text-center">
          <p className="text-sm text-cocoa">
            {status === "not-found" ? "找不到餐廳" : "載入菜單失敗"}
          </p>
          <Link
            href={`/restaurants/${restaurantId}`}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button"
          >
            回餐廳
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <MenuPageHeader title="菜單" subtitle={restaurantName} />
      <div className="px-5 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">共 {items.length} 項</p>
          <Link
            href={`/restaurants/${restaurantId}/menu/edit`}
            className="text-xs font-bold text-caramel underline-offset-2 hover:underline"
          >
            管理菜單
          </Link>
        </div>
        <MenuBrowseList items={items} />
      </div>
    </div>
  );
}
