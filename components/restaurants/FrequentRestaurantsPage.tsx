"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import TopBar from "@/components/layout/TopBar";
import RestaurantCard from "@/components/restaurants/RestaurantCard";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { mapRestaurantRecordToListItem } from "@/src/lib/map-restaurant-list-item";
import type { GeoPoint } from "@/src/lib/restaurants/distance";
import type { Restaurant } from "@/src/lib/restaurant-types";
import { listFavorites } from "@/src/services/favorite";
import { listFrequentRestaurants } from "@/src/services/frequent";

type LoadStatus = "loading" | "ready" | "error";

type FrequentListItem = {
  restaurant: Restaurant;
  visitCount: number;
  rank: number;
};

async function fetchFrequentListItems(
  groupId: string,
  reference: GeoPoint | null,
): Promise<FrequentListItem[]> {
  const [frequent, favorites] = await Promise.all([
    listFrequentRestaurants(groupId),
    listFavorites(),
  ]);
  const favoriteIds = new Set(
    favorites.map((favorite) => favorite.restaurantId),
  );

  return frequent.map((item) => ({
    restaurant: mapRestaurantRecordToListItem(
      item.restaurant,
      reference,
      favoriteIds.has(item.restaurant.id),
    ),
    visitCount: item.visitCount,
    rank: item.rank,
  }));
}

export default function FrequentRestaurantsPage() {
  const router = useRouter();
  const {
    revision,
    currentGroupId,
    currentGroup,
    loading: groupLoading,
  } = useCurrentGroup();
  const [items, setItems] = useState<FrequentListItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const referenceLat = currentGroup?.referenceLat ?? null;
  const referenceLng = currentGroup?.referenceLng ?? null;

  useEffect(() => {
    if (groupLoading) {
      return;
    }

    let cancelled = false;

    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        if (!currentGroupId) {
          setItems([]);
          setStatus("ready");
          return;
        }

        setStatus("loading");

        try {
          const reference: GeoPoint | null =
            referenceLat != null && referenceLng != null
              ? { lat: referenceLat, lng: referenceLng }
              : null;
          const next = await fetchFrequentListItems(currentGroupId, reference);
          if (!cancelled) {
            setItems(next);
            setStatus("ready");
          }
        } catch {
          if (!cancelled) {
            setItems([]);
            setStatus("error");
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [revision, currentGroupId, groupLoading, referenceLat, referenceLng]);

  async function handleRetry() {
    if (!currentGroupId) {
      return;
    }

    setStatus("loading");

    try {
      const reference: GeoPoint | null =
        referenceLat != null && referenceLng != null
          ? { lat: referenceLat, lng: referenceLng }
          : null;
      const next = await fetchFrequentListItems(currentGroupId, reference);
      setItems(next);
      setStatus("ready");
    } catch {
      setItems([]);
      setStatus("error");
    }
  }

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />

      <header className="px-5 pt-3 pb-4">
        <h1 className="font-display text-2xl font-bold text-deep-brown">
          🍜 常吃餐廳
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          依據美食日記統計你的回訪次數
        </p>
      </header>

      <section className="px-5 pt-2 pb-8">
        {status === "loading" || groupLoading ? (
          <div className="flex animate-pulse flex-col gap-4" aria-hidden>
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
          </div>
        ) : null}

        {!groupLoading && status === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-cocoa">載入常吃餐廳失敗</p>
            <button
              type="button"
              onClick={() => {
                void handleRetry();
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {!groupLoading && status === "ready" && items.length === 0 ? (
          <section className="flex flex-col items-center px-2 pt-12 text-center">
            <span className="text-4xl leading-none" aria-hidden>
              🍜
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-deep-brown">
              還沒有任何美食日記。
            </h2>
            <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-text-secondary">
              記錄第一次用餐後，
              <br />
              這裡就會出現你的常吃餐廳排行榜。
            </p>
            <Link
              href="/restaurants"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-caramel px-8 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              新增美食日記
            </Link>
          </section>
        ) : null}

        {!groupLoading && status === "ready" && items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <RestaurantCard
                key={item.restaurant.id}
                restaurant={item.restaurant}
                visitCount={item.visitCount}
                rank={item.rank}
                onClick={() =>
                  router.push(`/restaurants/${item.restaurant.id}`)
                }
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
