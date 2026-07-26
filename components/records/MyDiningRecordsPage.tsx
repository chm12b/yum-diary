"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import MyDiningRecordCard, {
  type MyDiningRecordCardData,
} from "@/components/records/MyDiningRecordCard";
import { homeAssets } from "@/src/lib/home-assets";
import { listMyRecords } from "@/src/services/record";
import { listRecordFoodsByRecordIds } from "@/src/services/record-food";
import { listFirstRecordPhotoUrls } from "@/src/services/record-photo";
import { listRestaurantNamesByIds } from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

const iconButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft transition-transform active:scale-[0.98]";

async function fetchMyDiningRecordCards(): Promise<
  MyDiningRecordCardData[]
> {
  const rows = await listMyRecords();
  const recordIds = rows.map((record) => record.id);
  const restaurantIds = rows.map((record) => record.restaurant_id);

  const [restaurantNames, photoUrls, foodsByRecord] = await Promise.all([
    listRestaurantNamesByIds(restaurantIds),
    listFirstRecordPhotoUrls(recordIds),
    listRecordFoodsByRecordIds(recordIds),
  ]);

  return rows.map((record) => ({
    id: record.id,
    restaurantId: record.restaurant_id,
    restaurantName:
      restaurantNames.get(record.restaurant_id) ?? "未知餐廳",
    visitDate: record.visit_date,
    rating: record.rating,
    notes: record.notes,
    photo: photoUrls.get(record.id) ?? null,
    foods: foodsByRecord.get(record.id) ?? [],
  }));
}

export default function MyDiningRecordsPage() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [records, setRecords] = useState<MyDiningRecordCardData[]>([]);

  async function retryLoad() {
    setStatus("loading");

    try {
      setRecords(await fetchMyDiningRecordCards());
      setStatus("ready");
    } catch {
      setRecords([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    let cancelled = false;

    void fetchMyDiningRecordCards()
      .then((nextRecords) => {
        if (!cancelled) {
          setRecords(nextRecords);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecords([]);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MyRecordsHeader />
        <div className="animate-pulse space-y-4 px-5 pt-6" aria-hidden>
          <div className="mx-auto h-20 w-52 rounded-2xl bg-border/60" />
          <div className="h-52 rounded-2xl bg-border/70" />
          <div className="h-52 rounded-2xl bg-border/60" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="home-grid-bg min-h-full pb-8">
        <MyRecordsHeader />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">載入美食日記失敗</p>
          <button
            type="button"
            onClick={() => void retryLoad()}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-transform active:scale-[0.98]"
          >
            重新整理
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <MyRecordsHeader />

      <section className="relative px-5 pt-3 pb-5 text-center">
        <p className="font-display text-base tracking-wide text-deep-brown">
          每一次的美味，都值得被記住 ♡
        </p>
        <p className="mt-3 text-sm text-cocoa">
          共 {records.length} 篇紀錄
        </p>
        <Image
          src={homeAssets.myDiaryBunny}
          alt=""
          width={95}
          height={90}
          aria-hidden
          className="pointer-events-none absolute right-5 bottom-0 h-[90px] w-[95px] object-contain opacity-90"
        />
      </section>

      {records.length === 0 ? (
        <section className="mx-5 mt-5 flex flex-col items-center rounded-3xl border border-dashed border-border bg-rice-white/75 px-6 py-10 text-center shadow-soft">
          <Image
            src={homeAssets.myDiaryBunny}
            alt=""
            width={132}
            height={125}
            className="h-[125px] w-[132px] object-contain"
          />
          <p className="mt-3 text-base font-bold text-deep-brown">
            還沒有任何美食日記。
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            開始記錄第一篇吧！
          </p>
          <Link
            href="/restaurants"
            className="mt-5 rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-transform active:scale-[0.98]"
          >
            前往餐廳列表
          </Link>
        </section>
      ) : (
        <section className="px-5 pb-6">
          <div className="relative pl-5">
            <div
              aria-hidden
              className="absolute top-5 bottom-5 left-[5px] border-l-2 border-dashed border-caramel/30"
            />
            <ul className="space-y-4">
              {records.map((record) => (
                <li key={record.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-7 -left-[20px] z-10 h-3 w-3 rounded-full border-2 border-rice-white bg-sakura-pink shadow-soft"
                  />
                  <MyDiningRecordCard record={record} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function MyRecordsHeader() {
  return (
    <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-5 pt-4 pb-2">
      <Link href="/" aria-label="返回首頁" className={iconButtonClass}>
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
      <h1 className="truncate text-center font-display text-lg font-bold text-deep-brown">
        📔 我的美食日記
      </h1>
      <span aria-hidden className="h-10 w-10" />
    </header>
  );
}
