"use client";

import { useEffect, useState } from "react";

import BunnyHero from "@/components/home/BunnyHero";
import GroupOrderHomeCard from "@/components/home/GroupOrderHomeCard";
import HomeEntryList from "@/components/home/HomeEntryList";
import HomeGreeting from "@/components/home/HomeGreeting";
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
    <div className="mt-4 flex animate-pulse flex-col gap-4 px-5" aria-hidden>
      <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
      <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
      <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
    </div>
  );
}

export default function HomePage() {
  const { revision, currentGroupId, loading: groupLoading } = useCurrentGroup();
  const [status, setStatus] = useState<HomeStatus>("loading");
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [loadedGroupId, setLoadedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (groupLoading || !currentGroupId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error } = await listRestaurants(currentGroupId);
      if (cancelled) {
        return;
      }

      if (error) {
        setRestaurants([]);
        setLoadedGroupId(currentGroupId);
        setStatus("error");
        return;
      }

      setRestaurants(data);
      setLoadedGroupId(currentGroupId);
      setStatus(data.length === 0 ? "empty" : "hasData");
    })();

    return () => {
      cancelled = true;
    };
  }, [revision, currentGroupId, groupLoading]);

  async function retryLoad() {
    if (!currentGroupId) {
      return;
    }

    const { data, error } = await listRestaurants(currentGroupId);
    if (error) {
      setRestaurants([]);
      setLoadedGroupId(currentGroupId);
      setStatus("error");
      return;
    }

    setRestaurants(data);
    setLoadedGroupId(currentGroupId);
    setStatus(data.length === 0 ? "empty" : "hasData");
  }

  const restaurantsPending =
    Boolean(currentGroupId) &&
    (status === "loading" || loadedGroupId !== currentGroupId);

  const showEmpty =
    !groupLoading &&
    (!currentGroupId ||
      (status === "empty" && loadedGroupId === currentGroupId));
  const showError =
    !groupLoading &&
    Boolean(currentGroupId) &&
    status === "error" &&
    loadedGroupId === currentGroupId;
  const showHasData =
    !groupLoading &&
    Boolean(currentGroupId) &&
    status === "hasData" &&
    loadedGroupId === currentGroupId;
  const showRestaurantLoading = !groupLoading && restaurantsPending;

  return (
    <div className="home-grid-bg min-h-full pb-10">
      <TopBar />
      <HomeGreeting />
      <BunnyHero />

      {groupLoading ? (
        <div
          className="-mt-[40px] flex animate-pulse flex-col gap-4 px-5 pt-[50px]"
          aria-hidden
        >
          <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
          <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
          <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
          <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
        </div>
      ) : (
        <>
          <section className="-mt-[40px] px-5 pt-[50px]">
            <GroupOrderHomeCard />
          </section>

          {showRestaurantLoading ? <HomeEntriesSkeleton /> : null}

          {showError ? (
            <section className="flex flex-col items-center gap-4 px-5 pt-16 pb-10 text-center">
              <p className="text-sm font-medium text-cocoa">載入餐廳失敗</p>
              <button
                type="button"
                onClick={() => {
                  void retryLoad();
                }}
                className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                重新整理
              </button>
            </section>
          ) : null}

          {showEmpty && !showRestaurantLoading ? (
            <RestaurantEmptyState />
          ) : null}

          {showHasData ? (
            <div aria-label={`已收藏 ${restaurants.length} 間餐廳`}>
              <HomeEntryList revision={revision} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
