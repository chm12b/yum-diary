"use client";

import { useEffect, useState } from "react";

import BunnyHero from "@/components/home/BunnyHero";
import HomeEntryList from "@/components/home/HomeEntryList";
import HomeGreeting from "@/components/home/HomeGreeting";
import HomeSearchSection from "@/components/home/HomeSearchSection";
import RestaurantEmptyState from "@/components/home/RestaurantEmptyState";
import TopBar from "@/components/layout/TopBar";
import {
  listRestaurants,
  type RestaurantRow,
} from "@/src/services/restaurants/restaurant.service";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";

type HomeStatus = "loading" | "error" | "empty" | "hasData";

/** Skeleton only for the restaurant-dependent middle section. */
function HomeEntriesSkeleton() {
  return (
    <div
      className="-mt-[40px] flex animate-pulse flex-col gap-4 px-5 pt-[50px]"
      aria-hidden
    >
      <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
      <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
    </div>
  );
}

export default function HomePage() {
  const { revision, currentGroupId, loading: groupLoading } = useCurrentGroup();
  const [status, setStatus] = useState<HomeStatus>("loading");
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);

  async function loadRestaurants(groupId: string) {
    setStatus("loading");

    const { data, error } = await listRestaurants(groupId);

    if (error) {
      setRestaurants([]);
      setStatus("error");
      return;
    }

    setRestaurants(data);
    setStatus(data.length === 0 ? "empty" : "hasData");
  }

  useEffect(() => {
    if (groupLoading) {
      return;
    }

    if (!currentGroupId) {
      setRestaurants([]);
      setStatus("empty");
      return;
    }

    void loadRestaurants(currentGroupId);
  }, [revision, currentGroupId, groupLoading]);

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />
      <HomeGreeting />
      <BunnyHero />

      {status === "loading" || groupLoading ? <HomeEntriesSkeleton /> : null}

      {!groupLoading && status === "error" ? (
        <section className="flex flex-col items-center gap-4 px-5 pt-16 pb-10 text-center">
          <p className="text-sm font-medium text-cocoa">載入餐廳失敗</p>
          <button
            type="button"
            onClick={() => {
              if (currentGroupId) {
                void loadRestaurants(currentGroupId);
              }
            }}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </section>
      ) : null}

      {!groupLoading && status === "empty" ? <RestaurantEmptyState /> : null}

      {!groupLoading && status === "hasData" ? (
        <div aria-label={`已收藏 ${restaurants.length} 間餐廳`}>
          <HomeEntryList />
        </div>
      ) : null}

      <HomeSearchSection />
    </div>
  );
}
