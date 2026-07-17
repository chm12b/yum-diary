"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import DetailActionBar from "@/components/restaurants/detail/DetailActionBar";
import DetailHeader from "@/components/restaurants/detail/DetailHeader";
import Identity from "@/components/restaurants/detail/Identity";
import MenuSection from "@/components/restaurants/detail/MenuSection";
import MyRecordSection from "@/components/restaurants/detail/MyRecordSection";
import RestaurantInfoList from "@/components/restaurants/detail/RestaurantInfoList";
import { mapRestaurantRecordToDetail } from "@/src/lib/map-restaurant-detail";
import type { GeoPoint } from "@/src/lib/restaurants/distance";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import { getCurrentGroup } from "@/src/services/groups/group.service";
import { listProfileDisplayNames } from "@/src/services/profile/profile.service";
import { listRestaurantRecords } from "@/src/services/record";
import { listFirstRecordPhotoUrls } from "@/src/services/record-photo";
import {
  getRestaurant,
  GoogleSyncNotFoundError,
  syncRestaurantFromGoogle,
} from "@/src/services/restaurant";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";

type DetailPageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

export default function DetailPage({ restaurantId }: DetailPageProps) {
  const { revision } = useCurrentGroup();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const referenceRef = useRef<GeoPoint | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  async function loadRestaurant() {
    setStatus("loading");

    try {
      const [row, diningRecords, groupResult] = await Promise.all([
        getRestaurant(restaurantId),
        listRestaurantRecords(restaurantId),
        getCurrentGroup(),
      ]);

      const firstPhotoUrls = await listFirstRecordPhotoUrls(
        diningRecords.map((record) => record.id),
      );
      const authorNames = await listProfileDisplayNames(
        diningRecords.map((record) => record.user_id),
      );

      referenceRef.current = groupResult.data
        ? {
            lat: groupResult.data.referenceLat,
            lng: groupResult.data.referenceLng,
          }
        : null;

      if (!row) {
        setRestaurant(null);
        setStatus("not-found");
        return;
      }

      setRestaurant(
        mapRestaurantRecordToDetail(
          row,
          diningRecords,
          referenceRef.current,
          firstPhotoUrls,
          authorNames,
        ),
      );
      setStatus("ready");
    } catch {
      setRestaurant(null);
      setStatus("error");
    }
  }

  async function handleSyncGoogle() {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      const [updated, diningRecords] = await Promise.all([
        syncRestaurantFromGoogle(restaurantId),
        listRestaurantRecords(restaurantId),
      ]);
      const firstPhotoUrls = await listFirstRecordPhotoUrls(
        diningRecords.map((record) => record.id),
      );
      const authorNames = await listProfileDisplayNames(
        diningRecords.map((record) => record.user_id),
      );
      setRestaurant(
        mapRestaurantRecordToDetail(
          updated,
          diningRecords,
          referenceRef.current,
          firstPhotoUrls,
          authorNames,
        ),
      );
      showToast("success", "✨ 已同步最新 Google 資料");
    } catch (error) {
      const isNotFound =
        error instanceof GoogleSyncNotFoundError ||
        (error instanceof Error && error.name === "GoogleSyncNotFoundError");

      if (isNotFound) {
        showToast("error", "找不到 Google 資料");
      } else {
        showToast("error", "同步失敗，請稍後再試");
      }
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    void loadRestaurant();
  }, [restaurantId, revision]);

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
        canSyncGoogle={Boolean(restaurant.googlePlaceId)}
        isSyncing={isSyncing}
        onSyncGoogle={() => {
          void handleSyncGoogle();
        }}
      />
      <Identity restaurant={restaurant} />
      <RestaurantInfoList restaurant={restaurant} />
      <MenuSection
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
      <MyRecordSection restaurant={restaurant} />
      <DetailActionBar isFavorite={restaurant.isFavorite} />

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
