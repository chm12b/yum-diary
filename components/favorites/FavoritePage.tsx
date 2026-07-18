"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import TopBar from "@/components/layout/TopBar";
import RestaurantList from "@/components/restaurants/RestaurantList";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { mapRestaurantRecordToListItem } from "@/src/lib/map-restaurant-list-item";
import type { Restaurant } from "@/src/lib/restaurant-types";
import {
  listFavoriteRestaurants,
  toggleFavorite,
} from "@/src/services/favorite";

type LoadStatus = "loading" | "ready" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

export default function FavoritePage() {
  const router = useRouter();
  const { revision } = useCurrentGroup();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const pendingFavoriteIdsRef = useRef(new Set<string>());

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  async function loadFavorites() {
    setStatus("loading");

    try {
      const rows = await listFavoriteRestaurants();
      setRestaurants(
        rows.map((row) =>
          mapRestaurantRecordToListItem(row, null, true),
        ),
      );
      setStatus("ready");
    } catch {
      setRestaurants([]);
      setStatus("error");
    }
  }

  async function handleRemoveFavorite(restaurantId: string) {
    if (pendingFavoriteIdsRef.current.has(restaurantId)) {
      return;
    }

    const index = restaurants.findIndex(
      (restaurant) => restaurant.id === restaurantId,
    );
    if (index < 0) {
      return;
    }

    const removed = restaurants[index];
    pendingFavoriteIdsRef.current.add(restaurantId);
    setRestaurants((current) =>
      current.filter((restaurant) => restaurant.id !== restaurantId),
    );

    try {
      const favorite = await toggleFavorite(restaurantId);
      if (favorite) {
        setRestaurants((current) => {
          const next = [...current];
          next.splice(Math.min(index, next.length), 0, {
            ...removed,
            isFavorite: true,
          });
          return next;
        });
        return;
      }
      showToast("success", "已取消我的收藏。");
    } catch {
      setRestaurants((current) => {
        if (current.some((restaurant) => restaurant.id === restaurantId)) {
          return current;
        }
        const next = [...current];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
      showToast("error", "更新收藏失敗，請稍後再試。");
    } finally {
      pendingFavoriteIdsRef.current.delete(restaurantId);
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadFavorites();
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [revision]);

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />

      <header className="px-5 pt-3 pb-4">
        <h1 className="font-display text-2xl font-bold text-deep-brown">
          ❤️ 我的收藏
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          共 {restaurants.length} 間餐廳
        </p>
      </header>

      <section className="px-5 pt-2 pb-8">
        {status === "loading" ? (
          <div className="animate-pulse flex flex-col gap-4" aria-hidden>
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-cocoa">載入收藏失敗</p>
            <button
              type="button"
              onClick={() => {
                void loadFavorites();
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {status === "ready" && restaurants.length === 0 ? (
          <section className="flex flex-col items-center px-5 pt-12 text-center">
            <span className="text-4xl leading-none" aria-hidden>
              ❤️
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-deep-brown">
              還沒有收藏餐廳
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              看到喜歡的餐廳，
              <br />
              點一下 ❤️ 就會出現在這裡。
            </p>
            <Link
              href="/restaurants"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-caramel px-8 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              去逛餐廳
            </Link>
          </section>
        ) : null}

        {status === "ready" && restaurants.length > 0 ? (
          <RestaurantList
            restaurants={restaurants}
            onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
            onFavoriteClick={(id) => {
              void handleRemoveFavorite(id);
            }}
          />
        ) : null}
      </section>

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
