"use client";

import { useEffect, useState } from "react";

import EntryCard from "@/components/ui/EntryCard";
import { homeAssets } from "@/src/lib/home-assets";
import { NEARBY_QUICK_BROWSE_QUERY } from "@/src/lib/restaurants/nearby-quick-browse";
import { countMyRecords } from "@/src/services/record";

type HomeEntryListProps = {
  revision?: number;
};

export default function HomeEntryList({
  revision = 0,
}: HomeEntryListProps) {
  const [recordCount, setRecordCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void countMyRecords()
      .then((count) => {
        if (!cancelled) {
          setRecordCount(count);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecordCount(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [revision]);

  const diarySubtitle =
    recordCount === 0
      ? "開始記錄第一篇美食日記"
      : "查看所有美食日記";

  return (
    <section className="mt-4 flex flex-col gap-4 px-5">
      <EntryCard
        href={`/restaurants?${NEARBY_QUICK_BROWSE_QUERY}=1`}
        label="逛逛附近餐廳"
        subtitle="看看附近正在營業的店家"
        iconSrc={homeAssets.iconNearbyRestaurant}
        iconWidth={110}
      />
      <EntryCard
        href="/records"
        label="美食日記"
        subtitle={diarySubtitle}
        iconSrc={homeAssets.iconMyDiary}
        iconWidth={54}
      />
      <EntryCard
        href="/restaurants/frequent"
        label="常吃餐廳"
        subtitle="看看你最常回訪的店家"
        iconSrc={homeAssets.iconFrequentRestaurants}
        iconWidth={80}
      />
    </section>
  );
}
