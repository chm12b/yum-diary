"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import DetailActionBar from "@/components/restaurants/detail/DetailActionBar";
import DetailHeader from "@/components/restaurants/detail/DetailHeader";
import Identity from "@/components/restaurants/detail/Identity";
import MenuEntrySection from "@/components/restaurants/detail/MenuEntrySection";
import MenuSection from "@/components/restaurants/detail/MenuSection";
import MyRecordSection from "@/components/restaurants/detail/MyRecordSection";
import RestaurantInfoList from "@/components/restaurants/detail/RestaurantInfoList";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { mapRestaurantRecordToDetail } from "@/src/lib/map-restaurant-detail";
import {
  distanceMetersOrZero,
  type GeoPoint,
} from "@/src/lib/restaurants/distance";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import {
  isFavorite as getIsFavorite,
  toggleFavorite,
} from "@/src/services/favorite";
import { listProfileDisplayNames } from "@/src/services/profile/profile.service";
import { listRestaurantRecords } from "@/src/services/record";
import { listFirstRecordPhotoUrls } from "@/src/services/record-photo";
import {
  getRestaurant,
  GoogleSyncNotFoundError,
  syncRestaurantFromGoogle,
  type RestaurantRecord,
} from "@/src/services/restaurant";

type DetailPageProps = {
  restaurantId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";
type RecordsStatus = "loading" | "ready" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

function referenceFromGroup(
  currentGroup: {
    referenceLat: number | null;
    referenceLng: number | null;
  } | null,
): GeoPoint | null {
  if (
    currentGroup?.referenceLat != null &&
    currentGroup?.referenceLng != null
  ) {
    return {
      lat: currentGroup.referenceLat,
      lng: currentGroup.referenceLng,
    };
  }
  return null;
}

export default function DetailPage({ restaurantId }: DetailPageProps) {
  const { revision, currentGroup } = useCurrentGroup();
  const reference = useMemo(
    () => referenceFromGroup(currentGroup),
    [currentGroup],
  );

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [restaurantRow, setRestaurantRow] = useState<RestaurantRecord | null>(
    null,
  );
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [recordsStatus, setRecordsStatus] = useState<RecordsStatus>("loading");
  const [recordsReloadToken, setRecordsReloadToken] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteResolved, setIsFavoriteResolved] = useState(false);
  const [isFavoriteToggleLoading, setIsFavoriteToggleLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const restaurantRowRef = useRef<RestaurantRecord | null>(null);
  const referenceRef = useRef<GeoPoint | null>(reference);
  restaurantRowRef.current = restaurantRow;
  referenceRef.current = reference;

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

  /** Layer 1: restaurant core only — unlock main UI. */
  async function loadRestaurantCore() {
    setStatus("loading");
    setRestaurant(null);
    setRestaurantRow(null);
    setRecordsStatus("loading");
    setIsFavorite(false);
    setIsFavoriteResolved(false);

    try {
      const row = await getRestaurant(restaurantId);

      if (!row) {
        setRestaurant(null);
        setRestaurantRow(null);
        setStatus("not-found");
        setRecordsStatus("ready");
        setIsFavoriteResolved(true);
        return;
      }

      setRestaurantRow(row);
      setRestaurant(
        mapRestaurantRecordToDetail(row, [], reference, new Map(), new Map(), false),
      );
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load restaurant", { restaurantId, error });
      setRestaurant(null);
      setRestaurantRow(null);
      setStatus("error");
      setRecordsStatus("ready");
      setIsFavoriteResolved(true);
    }
  }

  /** Layer 2: favorite — does not block main UI. */
  useEffect(() => {
    if (status !== "ready" || !restaurantId) {
      return;
    }

    let cancelled = false;

    async function loadFavorite() {
      try {
        const favorite = await getIsFavorite(restaurantId);
        if (!cancelled) {
          setIsFavorite(favorite);
          setRestaurant((current) =>
            current ? { ...current, isFavorite: favorite } : current,
          );
        }
      } catch (error) {
        console.error("Failed to load favorite state", { restaurantId, error });
        if (!cancelled) {
          setIsFavorite(false);
        }
      } finally {
        if (!cancelled) {
          setIsFavoriteResolved(true);
        }
      }
    }

    void loadFavorite();

    return () => {
      cancelled = true;
    };
  }, [status, restaurantId, revision]);

  /** Layer 4: diary records / photos / author names. */
  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    const row = restaurantRowRef.current;
    if (!row) {
      return;
    }

    let cancelled = false;

    async function loadRecords() {
      setRecordsStatus("loading");

      try {
        let diningRecords: Awaited<
          ReturnType<typeof listRestaurantRecords>
        > = [];
        try {
          diningRecords = await listRestaurantRecords(restaurantId);
        } catch (error) {
          console.error("Failed to load restaurant records", {
            restaurantId,
            error,
          });
          diningRecords = [];
        }

        if (cancelled) {
          return;
        }

        let firstPhotoUrls = new Map<string, string>();
        try {
          firstPhotoUrls = await listFirstRecordPhotoUrls(
            diningRecords.map((record) => record.id),
          );
        } catch (error) {
          console.error("Failed to load first record photo urls", {
            restaurantId,
            error,
          });
        }

        if (cancelled) {
          return;
        }

        let authorNames = new Map<string, string>();
        try {
          authorNames = await listProfileDisplayNames(
            diningRecords.map((record) => record.user_id),
          );
        } catch (error) {
          console.error("Failed to load record author names", {
            restaurantId,
            error,
          });
        }

        if (cancelled) {
          return;
        }

        const latestRow = restaurantRowRef.current;
        if (!latestRow) {
          return;
        }

        setRestaurant((current) => {
          if (!current) {
            return current;
          }

          return mapRestaurantRecordToDetail(
            latestRow,
            diningRecords,
            referenceRef.current,
            firstPhotoUrls,
            authorNames,
            current.isFavorite,
          );
        });
        setRecordsStatus("ready");
      } catch (error) {
        console.error("Failed to load restaurant diary section", {
          restaurantId,
          error,
        });
        if (!cancelled) {
          setRecordsStatus("error");
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [status, restaurantId, revision, recordsReloadToken]);

  /** Keep distance in sync when Context reference arrives/changes. */
  useEffect(() => {
    if (!restaurantRow || status !== "ready") {
      return;
    }

    const nextDistance = distanceMetersOrZero(
      { lat: restaurantRow.latitude, lng: restaurantRow.longitude },
      reference,
    );

    setRestaurant((current) => {
      if (!current || current.distanceMeters === nextDistance) {
        return current;
      }
      return { ...current, distanceMeters: nextDistance };
    });
  }, [reference, restaurantRow, status]);

  async function handleSyncGoogle() {
    if (isSyncing || !restaurantRow) {
      return;
    }

    setIsSyncing(true);

    try {
      const updated = await syncRestaurantFromGoogle(restaurantId);
      setRestaurantRow(updated);

      let diningRecords: Awaited<
        ReturnType<typeof listRestaurantRecords>
      > = [];
      try {
        diningRecords = await listRestaurantRecords(restaurantId);
      } catch {
        diningRecords = [];
      }

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
          reference,
          firstPhotoUrls,
          authorNames,
          isFavorite,
        ),
      );
      setRecordsStatus("ready");
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

  async function handleToggleFavorite() {
    if (!restaurant || isFavoriteToggleLoading || !isFavoriteResolved) {
      return;
    }

    const previous = isFavorite;
    setIsFavoriteToggleLoading(true);
    setIsFavorite(!previous);
    setRestaurant((current) =>
      current ? { ...current, isFavorite: !previous } : current,
    );

    try {
      const favorite = await toggleFavorite(restaurant.id);
      setIsFavorite(favorite);
      setRestaurant((current) =>
        current ? { ...current, isFavorite: favorite } : current,
      );
      showToast(
        "success",
        favorite ? "已加入我的收藏。" : "已取消我的收藏。",
      );
    } catch {
      setIsFavorite(previous);
      setRestaurant((current) =>
        current ? { ...current, isFavorite: previous } : current,
      );
      showToast("error", "更新收藏失敗，請稍後再試。");
    } finally {
      setIsFavoriteToggleLoading(false);
    }
  }

  useEffect(() => {
    void loadRestaurantCore();
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
              void loadRestaurantCore();
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
        isFavorite={isFavorite}
        isFavoriteLoading={isFavoriteToggleLoading || !isFavoriteResolved}
        restaurantId={restaurant.id}
        canSyncGoogle={Boolean(restaurant.googlePlaceId)}
        isSyncing={isSyncing}
        onSyncGoogle={() => {
          void handleSyncGoogle();
        }}
        onToggleFavorite={() => {
          void handleToggleFavorite();
        }}
      />
      <Identity restaurant={restaurant} />
      <RestaurantInfoList restaurant={restaurant} />
      <MenuSection
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
      <MenuEntrySection restaurantId={restaurant.id} />
      <MyRecordSection
        restaurant={restaurant}
        status={recordsStatus}
        onRetry={() => {
          setRecordsReloadToken((token) => token + 1);
        }}
      />
      <DetailActionBar
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
        address={restaurant.address}
        onToast={showToast}
      />

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
