"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import MenuBrowseList from "@/components/menu/MenuBrowseList";
import MenuPageHeader from "@/components/menu/MenuPageHeader";
import { getRestaurant } from "@/src/services/restaurant";
import { listMenuItems, type MenuItem } from "@/src/services/menu-item";

type MenuBrowsePageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

const MENU_COPY_TIP_KEY = "menu_copy_tip_seen";
const TOAST_MS = 1800;

export default function MenuBrowsePage({ restaurantId }: MenuBrowsePageProps) {
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [showCopyTip, setShowCopyTip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

        if (menuItems.length > 0) {
          try {
            const seen = window.localStorage.getItem(MENU_COPY_TIP_KEY);
            if (seen !== "1") {
              setShowCopyTip(true);
              window.localStorage.setItem(MENU_COPY_TIP_KEY, "1");
              window.setTimeout(() => {
                if (!cancelled) {
                  setShowCopyTip(false);
                }
              }, 4500);
            }
          } catch {
            // localStorage may be unavailable (private mode).
          }
        }
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

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  function handleCopyItemName(name: string) {
    showToast(`📋 已複製「${name}」`);
  }

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

        {showCopyTip ? (
          <p
            role="status"
            className="mb-3 rounded-2xl border border-caramel/25 bg-sakura-pink/50 px-3.5 py-2.5 text-center text-xs font-medium text-deep-brown"
          >
            💡 小技巧：長按餐點即可快速複製名稱。
          </p>
        ) : null}

        <MenuBrowseList items={items} onCopyItemName={handleCopyItemName} />
      </div>

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
