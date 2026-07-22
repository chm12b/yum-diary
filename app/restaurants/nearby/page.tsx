"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import TopBar from "@/components/layout/TopBar";
import StarRating from "@/components/restaurants/StarRating";
import { homeAssets } from "@/src/lib/home-assets";
import {
  buildNearbySearchGrid,
  GRID_CELL_COUNT,
} from "@/src/lib/google/places/nearby-grid";
import { formatDistance, haversineMeters } from "@/src/lib/restaurants/distance";
import { mapGoogleCategory } from "@/src/lib/restaurants/category";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { getReferenceLocation } from "@/src/services/groups/group.service";
import { createRestaurant, listRestaurants } from "@/src/services/restaurant";
import { uploadRestaurantCover } from "@/src/services/restaurant-cover";
import type {
  PlaceDetailItem,
  PlaceSearchItem,
  PlacesApiResponse,
} from "@/src/lib/google/places/types";
import type { GeoPoint } from "@/src/lib/restaurants/distance";

type ToastState = { type: "success" | "error"; message: string } | null;

type ReferenceState =
  | { groupId: string; lat: number; lng: number }
  | { groupId: string; lat: null; lng: null };

const RADIUS_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "500m", value: 500 },
  { label: "1000m", value: 1000 },
  { label: "3000m", value: 3000 },
  { label: "5000m", value: 5000 },
];

type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";

function computeDistanceMeters(
  reference: GeoPoint,
  place: PlaceSearchItem,
): number {
  if (place.latitude == null || place.longitude == null) return 0;
  return haversineMeters(
    { lat: place.latitude, lng: place.longitude },
    reference,
  );
}

function mergePlacesById(
  existing: PlaceSearchItem[],
  incoming: PlaceSearchItem[],
): PlaceSearchItem[] {
  const byId = new Map<string, PlaceSearchItem>();
  for (const place of existing) {
    byId.set(place.id, place);
  }
  for (const place of incoming) {
    if (!byId.has(place.id)) {
      byId.set(place.id, place);
    }
  }
  return Array.from(byId.values());
}

function sortPlacesByDistance(
  places: PlaceSearchItem[],
  referencePoint: GeoPoint,
): PlaceSearchItem[] {
  return [...places].sort((a, b) => {
    return (
      computeDistanceMeters(referencePoint, a) -
      computeDistanceMeters(referencePoint, b)
    );
  });
}

function PlaceholderCard() {
  return (
    <div className="flex gap-3">
      <div className="mt-6 h-5 w-5 rounded bg-border/70" aria-hidden />
      <div
        className="h-[150px] flex-1 rounded-[1.25rem] border border-border bg-border/60"
        aria-hidden
      />
    </div>
  );
}

export default function NearbyImportPage() {
  const router = useRouter();
  const { revision, currentGroupId } = useCurrentGroup();

  const [reference, setReference] = useState<ReferenceState | null>(null);
  const [showNoReferenceDialog, setShowNoReferenceDialog] = useState(false);

  const [radiusMeters, setRadiusMeters] = useState(1000);
  const [hideImported, setHideImported] = useState(true);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [places, setPlaces] = useState<PlaceSearchItem[]>([]);
  const [gridProgress, setGridProgress] = useState({
    completed: 0,
    total: GRID_CELL_COUNT,
  });
  const [hadPartialGridFailure, setHadPartialGridFailure] = useState(false);

  const [importedPlaceIds, setImportedPlaceIds] = useState<string[]>([]);
  const importedPlaceSet = useMemo(
    () => new Set(importedPlaceIds),
    [importedPlaceIds],
  );

  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(
    () => new Set(),
  );

  const selectedCount = selectedPlaceIds.size;

  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const canSearch =
    reference != null && reference.lat != null && reference.lng != null;

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceAndImported() {
      setShowNoReferenceDialog(false);
      setReference(null);
      setSearchStatus("idle");
      setPlaces([]);
      setImportedPlaceIds([]);
      setSelectedPlaceIds(new Set());
      setGridProgress({ completed: 0, total: GRID_CELL_COUNT });
      setHadPartialGridFailure(false);

      const { data, error } = await getReferenceLocation();

      if (
        cancelled ||
        error ||
        !data ||
        data.lat == null ||
        data.lng == null ||
        !Number.isFinite(data.lat) ||
        !Number.isFinite(data.lng)
      ) {
        if (!cancelled) {
          setShowNoReferenceDialog(true);
        }
        return;
      }

      setReference({ groupId: data.groupId, lat: data.lat, lng: data.lng });

      try {
        if (!currentGroupId) {
          if (!cancelled) {
            setImportedPlaceIds([]);
          }
          return;
        }

        const rows = await listRestaurants(currentGroupId);
        const ids = rows
          .map((r) => r.google_place_id?.trim() ?? "")
          .filter((id) => id.length > 0);
        if (!cancelled) {
          setImportedPlaceIds(Array.from(new Set(ids)));
        }
      } catch {
        if (!cancelled) {
          setImportedPlaceIds([]);
        }
      }
    }

    void loadReferenceAndImported();

    return () => {
      cancelled = true;
    };
  }, [revision, currentGroupId]);

  // Sequential 3×3 grid Nearby Search; update UI after each cell.
  useEffect(() => {
    if (!reference || reference.lat == null || reference.lng == null) {
      return;
    }

    let cancelled = false;
    const referencePoint: GeoPoint = { lat: reference.lat, lng: reference.lng };

    async function loadNearbyGrid() {
      setSearchStatus("loading");
      setPlaces([]);
      setSelectedPlaceIds(new Set());
      setGridProgress({ completed: 0, total: GRID_CELL_COUNT });
      setHadPartialGridFailure(false);

      const centers = buildNearbySearchGrid(referencePoint, radiusMeters);
      let merged: PlaceSearchItem[] = [];
      let anyGridFailed = false;

      for (let index = 0; index < centers.length; index += 1) {
        if (cancelled) {
          return;
        }

        const center = centers[index];

        try {
          const response = await fetch("/api/google/places/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: center.lat,
              longitude: center.lng,
              radiusMeters,
              maxResultCount: 20,
            }),
          });

          const payload =
            (await response.json()) as PlacesApiResponse<PlaceSearchItem[]>;

          if (cancelled) {
            return;
          }

          if (response.ok && payload.data) {
            merged = sortPlacesByDistance(
              mergePlacesById(merged, payload.data),
              referencePoint,
            );
            setPlaces(merged);
          } else if (response.status === 404) {
            // Empty cell — not a failure.
          } else {
            anyGridFailed = true;
          }
        } catch {
          if (cancelled) {
            return;
          }
          anyGridFailed = true;
        }

        if (!cancelled) {
          setGridProgress({
            completed: index + 1,
            total: GRID_CELL_COUNT,
          });
        }
      }

      if (cancelled) {
        return;
      }

      setHadPartialGridFailure(anyGridFailed);
      setSearchStatus(merged.length === 0 ? "empty" : "ready");

      if (anyGridFailed) {
        setToast({
          type: "error",
          message: "部分區域搜尋失敗，搜尋結果可能不完整。",
        });
        window.setTimeout(() => {
          setToast(null);
        }, 2800);
      }
    }

    void loadNearbyGrid();

    return () => {
      cancelled = true;
    };
  }, [radiusMeters, reference]);

  const totalCount = places.length;
  const importedCount = places.filter((p) => importedPlaceSet.has(p.id)).length;
  const availableCount = totalCount - importedCount;

  const availablePlaceIds = useMemo(
    () =>
      places
        .filter((p) => !importedPlaceSet.has(p.id))
        .map((p) => p.id),
    [places, importedPlaceSet],
  );

  const allAvailableSelected =
    availablePlaceIds.length > 0 &&
    availablePlaceIds.every((id) => selectedPlaceIds.has(id));

  const visiblePlaces = hideImported
    ? places.filter((p) => !importedPlaceSet.has(p.id))
    : places;

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => {
      setToast(null);
    }, 1800);
  }

  function toggleSelectAll() {
    if (allAvailableSelected) {
      setSelectedPlaceIds(new Set());
      return;
    }
    setSelectedPlaceIds(new Set(availablePlaceIds));
  }

  async function fetchPlaceDetail(placeId: string): Promise<PlaceDetailItem> {
    const response = await fetch(
      `/api/google/places/${encodeURIComponent(placeId)}`,
    );
    const payload =
      (await response.json()) as PlacesApiResponse<PlaceDetailItem>;
    if (!response.ok || payload.error || !payload.data) {
      throw new Error("Place detail fetch failed");
    }
    return payload.data;
  }

  function resolveCreateInput({
    groupId,
    detail,
  }: {
    groupId: string;
    detail: PlaceDetailItem;
  }) {
    const businessHours = detail.businessHours
      ? {
          periods: detail.businessHours.periods.map(({ open, close }) => ({
            open,
            close,
          })),
          closedDays: detail.businessHours.closedDays,
          openAllYear: detail.businessHours.openAllYear,
          irregularHolidays: detail.businessHours.irregularHolidays,
        }
      : null;

    return {
      groupId,
      name: detail.name.trim(),
      category: mapGoogleCategory(detail.category ?? undefined),
      address: detail.address.trim() || null,
      phone: detail.phone?.trim() || null,
      website: detail.website?.trim() || null,
      note: null,
      googlePlaceId: detail.id.trim(),
      googleRating: detail.rating,
      googleRatingCount: detail.reviewCount,
      priceLevel: detail.priceLevel,
      priceMin: detail.priceMin,
      priceMax: detail.priceMax,
      latitude: detail.latitude,
      longitude: detail.longitude,
      businessHours,
    };
  }

  async function importPlaceIds(
    placeIds: string[],
    options?: { navigateAfter?: boolean },
  ) {
    if (!reference || isImporting) return;
    if (placeIds.length === 0) return;

    setIsImporting(true);

    const groupId = reference.groupId;
    let successCount = 0;
    let failCount = 0;
    const newlyImported: string[] = [];

    for (const placeId of placeIds) {
      if (importedPlaceSet.has(placeId)) continue;

      try {
        const detail = await fetchPlaceDetail(placeId);
        const input = resolveCreateInput({ groupId, detail });

        const created = await createRestaurant(input);

        if (detail.photo) {
          try {
            const photoResponse = await fetch(
              `/api/google/places/photo?name=${encodeURIComponent(detail.photo)}`,
            );
            if (photoResponse.ok) {
              const blob = await photoResponse.blob();
              await uploadRestaurantCover({
                restaurantId: created.id,
                file: blob,
              });
            }
          } catch {
            // Non-fatal.
          }
        }

        successCount += 1;
        newlyImported.push(placeId);
      } catch {
        failCount += 1;
      }
    }

    if (newlyImported.length > 0) {
      setImportedPlaceIds((prev) =>
        Array.from(new Set([...prev, ...newlyImported])),
      );
      setSelectedPlaceIds((prev) => {
        const next = new Set(prev);
        for (const id of newlyImported) {
          next.delete(id);
        }
        return next;
      });
    }

    setIsImporting(false);

    if (failCount > 0) {
      showToast("error", "部分餐廳加入失敗。");
    } else {
      showToast("success", `已加入 ${successCount} 間餐廳。`);
    }

    if (options?.navigateAfter) {
      window.setTimeout(() => {
        router.push("/restaurants");
      }, 700);
    }
  }

  async function handleImportSelected() {
    await importPlaceIds(Array.from(selectedPlaceIds), { navigateAfter: true });
  }

  const referencePoint: GeoPoint | null = useMemo(() => {
    if (!reference || reference.lat == null || reference.lng == null) return null;
    return { lat: reference.lat, lng: reference.lng };
  }, [reference]);

  const isSearching = searchStatus === "loading";
  const searchComplete =
    searchStatus === "ready" || searchStatus === "empty";

  return (
    <div className="home-grid-bg min-h-full pb-24">
      <TopBar />

      <header className="px-5 pt-4 pb-2">
        <h1 className="font-display text-base font-bold text-deep-brown">
          匯入附近餐廳
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          以群組預設位置為中心，建立附近餐廳資料庫。
        </p>
      </header>

      {canSearch ? (
        <section className="px-5 pt-3 pb-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-rice-white px-4 py-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isSearching || isImporting}
                    onClick={() => setRadiusMeters(opt.value)}
                    aria-pressed={radiusMeters === opt.value}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                      radiusMeters === opt.value
                        ? "border-caramel bg-sakura-pink text-deep-brown"
                        : "border-border bg-rice-white text-cocoa"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-deep-brown">
              <input
                type="checkbox"
                checked={hideImported}
                onChange={(e) => {
                  setHideImported(e.target.checked);
                }}
                className="h-5 w-5 accent-caramel"
              />
              隱藏已匯入餐廳
            </label>

            {isSearching ? (
              <div className="rounded-xl border border-dashed border-border bg-cream-bg/50 px-3 py-3 text-sm leading-relaxed text-deep-brown">
                <div className="font-medium">正在搜尋附近餐廳…</div>
                <div className="mt-1 text-text-secondary">
                  Grid：{gridProgress.completed} / {gridProgress.total}
                </div>
                <div className="text-text-secondary">
                  目前找到：{totalCount} 間餐廳
                </div>
              </div>
            ) : null}

            {searchComplete ? (
              <div className="rounded-xl border border-dashed border-border bg-cream-bg/50 px-3 py-3 text-sm leading-relaxed text-deep-brown">
                <div className="font-medium">搜尋完成！</div>
                <div className="mt-1 text-text-secondary">
                  共找到：{totalCount} 間附近餐廳
                </div>
                <div className="text-text-secondary">
                  其中：{importedCount} 間已加入
                </div>
                <div className="text-text-secondary">
                  {availableCount} 間可加入
                </div>
                {hadPartialGridFailure ? (
                  <div className="mt-1 text-xs text-cocoa">
                    部分區域搜尋失敗，結果可能不完整。
                  </div>
                ) : null}
              </div>
            ) : null}

            {searchComplete && availableCount > 0 ? (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-deep-brown">
                <input
                  type="checkbox"
                  checked={allAvailableSelected}
                  onChange={toggleSelectAll}
                  className="h-5 w-5 accent-caramel"
                />
                全選可加入餐廳
              </label>
            ) : null}
          </div>
        </section>
      ) : null}

      {canSearch ? (
        <>
          {isSearching && places.length === 0 ? (
            <section className="px-5 pt-2 pb-8">
              <div className="flex animate-pulse flex-col gap-4" aria-hidden>
                <PlaceholderCard />
                <PlaceholderCard />
                <PlaceholderCard />
              </div>
            </section>
          ) : null}

          {(isSearching && places.length > 0) ||
          searchStatus === "ready" ||
          searchStatus === "empty" ? (
            <section className="px-5 pt-2 pb-8">
              {visiblePlaces.length === 0 && !isSearching ? (
                <div className="flex flex-col items-center gap-3 px-5 pt-[50px] pb-10 text-center">
                  <span className="text-4xl leading-none" aria-hidden>
                    🐰
                  </span>
                  <h3 className="font-display text-base font-bold text-deep-brown">
                    目前附近沒有找到符合條件的餐廳。
                  </h3>
                  <p className="max-w-[18rem] text-sm leading-relaxed text-text-secondary">
                    可以試試：增加搜尋範圍。
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visiblePlaces.map((place) => {
                    const isImported = importedPlaceSet.has(place.id);
                    const distanceMeters = referencePoint
                      ? computeDistanceMeters(referencePoint, place)
                      : 0;

                    const disabled = isImported;
                    const checked = selectedPlaceIds.has(place.id);

                    return (
                      <div key={place.id} className="flex items-stretch gap-3">
                        <div className="flex items-start pt-5">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled || isImporting || isSearching}
                            onChange={() => {
                              if (disabled) return;
                              setSelectedPlaceIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(place.id)) next.delete(place.id);
                                else next.add(place.id);
                                return next;
                              });
                            }}
                            className="h-5 w-5 accent-caramel"
                            aria-label={`選擇 ${place.name}`}
                          />
                        </div>

                        <article className="relative flex w-full gap-3 rounded-[1.25rem] border border-border bg-rice-white px-3 pt-3 pb-0 text-left shadow-soft">
                          <div className="pointer-events-none relative z-10 shrink-0">
                            <div className="h-[100px] w-[120px] rounded-xl border-[3px] border-white bg-white p-1 shadow-soft">
                              <div className="relative h-full w-full overflow-hidden rounded-lg">
                                {place.photo ? (
                                  <img
                                    src={`/api/google/places/photo?name=${encodeURIComponent(
                                      place.photo,
                                    )}`}
                                    alt={place.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="h-full w-full bg-border/70"
                                    aria-hidden
                                  />
                                )}
                              </div>
                            </div>
                            <Image
                              src={homeAssets.stickerFlowerPink}
                              alt=""
                              width={40}
                              height={40}
                              aria-hidden
                              className="pointer-events-none absolute -right-1.5 bottom-2 h-10 w-10 translate-x-[0.3rem] translate-y-0 object-contain"
                            />
                          </div>

                          <div className="pointer-events-none relative z-10 flex min-h-[100px] min-w-0 flex-1 flex-col gap-1.5 pb-7 pr-6">
                            <h2 className="truncate font-bold text-deep-brown">
                              {place.name}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              <span className="text-xs text-cocoa">
                                {mapGoogleCategory(
                                  place.category ?? undefined,
                                )}
                              </span>
                              {place.rating != null && place.rating > 0 ? (
                                <StarRating
                                  rating={place.rating}
                                  reviewCount={place.reviewCount ?? 0}
                                />
                              ) : null}
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs text-cocoa">
                              {distanceMeters > 0 ? (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" strokeWidth={2} />
                                  {formatDistance(distanceMeters)}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[11px] text-text-secondary">
                              {place.address}
                            </p>

                            {!hideImported && isImported ? (
                              <p className="mt-2 text-[11px] font-medium text-cocoa">
                                ✓ 已加入
                              </p>
                            ) : null}
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
        </>
      ) : null}

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-40 mx-auto w-[min(100%-2rem,28rem)] px-0">
        <button
          type="button"
          disabled={
            selectedCount === 0 ||
            isImporting ||
            reference == null ||
            isSearching
          }
          onClick={() => {
            void handleImportSelected();
          }}
          className="flex h-12 w-full items-center justify-center rounded-full bg-caramel px-6 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
        >
          {isImporting ? "加入中…" : `加入（${selectedCount}）`}
        </button>
      </div>

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-[60] mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {showNoReferenceDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-deep-brown/40 px-6"
          onClick={() => {
            setShowNoReferenceDialog(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-border bg-rice-white px-5 py-5 text-center shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-display text-base font-bold text-deep-brown">
              尚未設定預設位置
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cocoa">
              匯入附近餐廳需要先設定群組預設位置，
              <br />
              才能搜尋附近的餐廳。
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowNoReferenceDialog(false);
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/settings/location");
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                立即設定
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
