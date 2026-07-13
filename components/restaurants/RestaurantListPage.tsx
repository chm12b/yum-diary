"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CategoryFilter from "@/components/restaurants/CategoryFilter";
import RestaurantList from "@/components/restaurants/RestaurantList";
import RestaurantPageHeader from "@/components/restaurants/RestaurantPageHeader";
import TopBar from "@/components/layout/TopBar";
import RestaurantEmptyState from "@/components/home/RestaurantEmptyState";
import SearchBar from "@/components/shared/SearchBar";
import { getFilteredRestaurants } from "@/src/lib/filter-restaurants";
import { homeAssets } from "@/src/lib/home-assets";
import { mapRestaurantRecordToListItem } from "@/src/lib/map-restaurant-list-item";
import { LIST_CATEGORY_FILTERS } from "@/src/lib/restaurants/category";
import type { Restaurant } from "@/src/lib/restaurant-types";
import { listRestaurants } from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

export default function RestaurantListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function loadRestaurants() {
    setStatus("loading");

    try {
      const rows = await listRestaurants();
      setRestaurants(rows.map(mapRestaurantRecordToListItem));
      setStatus("ready");
    } catch {
      setRestaurants([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(
    () =>
      getFilteredRestaurants(restaurants, searchQuery, activeCategoryId),
    [restaurants, searchQuery, activeCategoryId],
  );

  const showEmpty =
    status === "ready" &&
    restaurants.length === 0 &&
    searchQuery.trim() === "" &&
    activeCategoryId === "all";

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />
      <RestaurantPageHeader />
      <section className="px-5 pb-3">
        <div className="relative">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={32}
            height={32}
            aria-hidden
            className="pointer-events-none absolute -top-2 -right-1 rotate-12"
          />
        </div>
      </section>
      <section className="px-5 pb-4">
        <CategoryFilter
          items={LIST_CATEGORY_FILTERS}
          value={activeCategoryId}
          onChange={setActiveCategoryId}
        />
      </section>
      <section className="px-5 pt-2 pb-8">
        {status === "loading" ? (
          <div className="animate-pulse flex flex-col gap-4" aria-hidden>
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
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
          </div>
        ) : null}

        {showEmpty ? <RestaurantEmptyState /> : null}

        {status === "ready" && !showEmpty ? (
          <RestaurantList
            restaurants={filteredRestaurants}
            onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
          />
        ) : null}
      </section>
    </div>
  );
}
