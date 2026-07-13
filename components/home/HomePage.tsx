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

type HomeStatus = "loading" | "error" | "empty" | "hasData";

function HomeContentSkeleton() {
  return (
    <div className="animate-pulse px-5 pt-1 pb-10" aria-hidden>
      <div className="h-4 w-28 rounded-full bg-border" />
      <div className="mt-3 h-8 w-52 rounded-full bg-border" />
      <div className="mt-6 h-[250px] w-full rounded-[1.5rem] bg-border/70" />
      <div className="mx-auto mt-4 h-20 w-[300px] rounded-[1.75rem] bg-border" />
      <div className="mt-[50px] flex flex-col gap-4">
        <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
        <div className="h-[88px] w-full rounded-[1.25rem] bg-border/80" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [status, setStatus] = useState<HomeStatus>("loading");
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);

  async function loadRestaurants() {
    setStatus("loading");

    const { data, error } = await listRestaurants();

    if (error) {
      setRestaurants([]);
      setStatus("error");
      return;
    }

    setRestaurants(data);
    setStatus(data.length === 0 ? "empty" : "hasData");
  }

  useEffect(() => {
    void loadRestaurants();
  }, []);

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />

      {status === "loading" ? <HomeContentSkeleton /> : null}

      {status === "error" ? (
        <section className="flex flex-col items-center gap-4 px-5 pt-16 pb-10 text-center">
          <p className="text-sm font-medium text-cocoa">載入餐廳失敗</p>
          <button
            type="button"
            onClick={() => {
              void loadRestaurants();
            }}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </section>
      ) : null}

      {status === "empty" ? (
        <>
          <HomeGreeting />
          <BunnyHero />
          <RestaurantEmptyState />
          <HomeSearchSection />
        </>
      ) : null}

      {status === "hasData" ? (
        <>
          <HomeGreeting />
          <BunnyHero />
          <div aria-label={`已收藏 ${restaurants.length} 間餐廳`}>
            <HomeEntryList />
          </div>
          <HomeSearchSection />
        </>
      ) : null}
    </div>
  );
}
