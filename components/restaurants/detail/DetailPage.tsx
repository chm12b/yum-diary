"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DetailActionBar from "@/components/restaurants/detail/DetailActionBar";
import DetailHeader from "@/components/restaurants/detail/DetailHeader";
import Identity from "@/components/restaurants/detail/Identity";
import MenuSection from "@/components/restaurants/detail/MenuSection";
import MyRecordSection from "@/components/restaurants/detail/MyRecordSection";
import RestaurantInfoList from "@/components/restaurants/detail/RestaurantInfoList";
import { mapRestaurantRecordToDetail } from "@/src/lib/map-restaurant-detail";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import { getRestaurant } from "@/src/services/restaurant";

type DetailPageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function DetailPage({ restaurantId }: DetailPageProps) {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function loadRestaurant() {
    setStatus("loading");

    try {
      const row = await getRestaurant(restaurantId);

      if (!row) {
        setRestaurant(null);
        setStatus("not-found");
        return;
      }

      setRestaurant(mapRestaurantRecordToDetail(row));
      setStatus("ready");
    } catch {
      setRestaurant(null);
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadRestaurant();
  }, [restaurantId]);

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-6">
        <DetailHeader isFavorite={false} />
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="flex gap-3">
            <div className="h-[120px] w-40 rounded-xl bg-border/80" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 w-40 rounded-full bg-border" />
              <div className="h-4 w-28 rounded-full bg-border/70" />
              <div className="h-4 w-20 rounded-full bg-border/60" />
            </div>
          </div>
          <div className="mt-8 h-40 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-6">
        <DetailHeader isFavorite={false} />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">載入餐廳失敗</p>
          <button
            type="button"
            onClick={() => {
              void loadRestaurant();
            }}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </section>
      </div>
    );
  }

  if (status === "not-found" || !restaurant) {
    return (
      <div className="home-grid-bg min-h-full pb-6">
        <DetailHeader isFavorite={false} />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">找不到這間餐廳</p>
          <Link
            href="/restaurants"
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            返回餐廳列表
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-6">
      <DetailHeader
        isFavorite={restaurant.isFavorite}
        restaurantId={restaurant.id}
      />
      <Identity restaurant={restaurant} />
      <RestaurantInfoList restaurant={restaurant} />
      <MenuSection menuImages={restaurant.menuImages} alt={restaurant.name} />
      <MyRecordSection restaurant={restaurant} />
      <DetailActionBar isFavorite={restaurant.isFavorite} />
    </div>
  );
}
