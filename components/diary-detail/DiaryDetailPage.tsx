"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DiaryDetailContent from "@/components/diary-detail/DiaryDetailContent";
import DiaryDetailHeader from "@/components/diary-detail/DiaryDetailHeader";
import OrderedFoodSection from "@/components/diary-detail/OrderedFoodSection";
import RecordPhotoSection from "@/components/diary-detail/RecordPhotoSection";
import { useAuth } from "@/src/hooks/useAuth";
import { getRecord, type DiningRecord } from "@/src/services/record";
import { listRecordFoods, type RecordFood } from "@/src/services/record-food";

type DiaryDetailPageProps = {
  recordId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function DiaryDetailPage({ recordId }: DiaryDetailPageProps) {
  const { user } = useAuth();
  const [record, setRecord] = useState<DiningRecord | null>(null);
  const [foods, setFoods] = useState<RecordFood[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");

      try {
        const [row, foodRows] = await Promise.all([
          getRecord(recordId),
          listRecordFoods(recordId),
        ]);

        if (cancelled) {
          return;
        }

        if (!row) {
          setRecord(null);
          setFoods([]);
          setStatus("not-found");
          return;
        }

        setRecord(row);
        setFoods(foodRows);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setRecord(null);
          setStatus("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [recordId, attempt]);

  if (status === "loading") {
    return (
      <div className="home-grid-bg min-h-full">
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="mx-auto h-9 w-40 rounded-full bg-border" />
          <div className="mt-8 h-48 w-full rounded-2xl bg-border/70" />
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
          onClick={() => setAttempt((n) => n + 1)}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          重新整理
        </button>
      </div>
    );
  }

  if (status === "not-found" || !record) {
    return (
      <div className="home-grid-bg flex min-h-full flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="text-sm font-medium text-cocoa">找不到這筆用餐紀錄</p>
        <Link
          href="/restaurants"
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          返回餐廳列表
        </Link>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full pb-6">
      <DiaryDetailHeader
        recordId={record.id}
        canEdit={Boolean(user && record.user_id === user.id)}
      />
      <DiaryDetailContent record={record} />
      <OrderedFoodSection foods={foods} />
      <RecordPhotoSection recordId={record.id} />
    </div>
  );
}
