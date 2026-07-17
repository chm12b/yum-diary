"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import RecordsFab from "@/components/records/RecordsFab";
import RecordsHeader from "@/components/records/RecordsHeader";
import RecordsTimeline from "@/components/records/RecordsTimeline";
import RecordsTitleSection from "@/components/records/RecordsTitleSection";
import { mapRestaurantRecordToDetail } from "@/src/lib/map-restaurant-detail";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import { listRestaurantRecords } from "@/src/services/record";
import { listFirstRecordPhotoUrls } from "@/src/services/record-photo";
import { listRecordFoods } from "@/src/services/record-food";
import { listProfileDisplayNames } from "@/src/services/profile/profile.service";
import { getRestaurant } from "@/src/services/restaurant";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";

type RecordsPageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function RecordsPage({ restaurantId }: RecordsPageProps) {
  const { revision } = useCurrentGroup();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function load() {
    setStatus("loading");

    try {
      const [row, diningRecords] = await Promise.all([
        getRestaurant(restaurantId),
        listRestaurantRecords(restaurantId),
      ]);

      const firstPhotoUrls = await listFirstRecordPhotoUrls(
        diningRecords.map((record) => record.id),
      );
      const authorNames = await listProfileDisplayNames(
        diningRecords.map((record) => record.user_id),
      );

      if (!row) {
        setRestaurant(null);
        setStatus("not-found");
        return;
      }

      const detail = mapRestaurantRecordToDetail(
        row,
        diningRecords,
        null,
        firstPhotoUrls,
        authorNames,
      );

      const recordsWithFoods = await Promise.all(
        (detail.records ?? []).map(async (record) => {
          const foods = await listRecordFoods(record.id);
          return {
            ...record,
            foods: foods.map((food) => food.name),
          };
        }),
      );

      setRestaurant({ ...detail, records: recordsWithFoods });
      setStatus("ready");
    } catch {
      setRestaurant(null);
      setStatus("error");
    }
  }

  useEffect(() => {
    void load();
  }, [restaurantId, revision]);

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full">
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="mx-auto h-9 w-40 rounded-full bg-border" />
          <div className="mt-8 h-28 w-full rounded-2xl bg-border/70" />
          <div className="mt-5 h-40 w-full rounded-2xl bg-border/60" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="home-grid-bg flex min-h-full flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="text-sm font-medium text-cocoa">載入紀錄失敗</p>
        <button
          type="button"
          onClick={() => {
            void load();
          }}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          重新整理
        </button>
      </div>
    );
  }

  if (status === "not-found" || !restaurant) {
    return (
      <div className="home-grid-bg flex min-h-full flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="text-sm font-medium text-cocoa">找不到這間餐廳</p>
        <Link
          href="/restaurants"
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          返回餐廳列表
        </Link>
      </div>
    );
  }

  const records = restaurant.records ?? [];

  return (
    <div className="home-grid-bg min-h-full">
      <RecordsHeader restaurant={restaurant} />
      <RecordsTitleSection recordCount={records.length} />
      <RecordsTimeline records={records} />
      <RecordsFab restaurantId={restaurant.id} />
    </div>
  );
}
