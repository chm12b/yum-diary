"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import CategoryChip from "@/components/restaurants/CategoryChip";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import {
  APP_CATEGORIES,
  type AppCategory,
} from "@/src/lib/restaurants/category";
import {
  DEFAULT_DECIDE_FILTERS,
  loadDecidePreferences,
  saveDecidePreferences,
  sameSelectedCategories,
  type DecideDistanceKm,
  type DecideFavoriteMode,
  type DecideFilters,
} from "@/src/services/decide";
import { getReferenceLocation } from "@/src/services/groups/group.service";
import { listRestaurantLocationOptions } from "@/src/services/restaurant";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

const selectClassName =
  "mt-1.5 h-11 w-full appearance-none rounded-xl border border-border bg-cream-bg/60 px-3 text-sm text-deep-brown outline-none transition-colors focus:border-caramel";

const DISTANCE_OPTIONS: Array<{
  value: DecideDistanceKm;
  label: string;
}> = [
  { value: null, label: "不限" },
  { value: 1, label: "1 km" },
  { value: 3, label: "3 km" },
  { value: 5, label: "5 km" },
];

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-rice-white px-4 py-4 shadow-soft">
      <h2 className="mb-3 font-display text-base font-bold text-deep-brown">
        {title}
      </h2>
      {children}
    </section>
  );
}

function sameDecideFilters(a: DecideFilters, b: DecideFilters): boolean {
  return (
    a.onlyOpen === b.onlyOpen &&
    a.city === b.city &&
    a.district === b.district &&
    a.maxDistanceKm === b.maxDistanceKm &&
    a.favoriteMode === b.favoriteMode &&
    sameSelectedCategories(a.selectedCategories, b.selectedCategories)
  );
}

export default function DecideSettingsPage() {
  const { currentGroupId, revision } = useCurrentGroup();
  const [ready, setReady] = useState(false);
  const [hasReferenceLocation, setHasReferenceLocation] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [districtsByCity, setDistrictsByCity] = useState<
    Record<string, string[]>
  >({});
  const [filters, setFilters] = useState<DecideFilters>(() => ({
    ...DEFAULT_DECIDE_FILTERS,
    selectedCategories: [...DEFAULT_DECIDE_FILTERS.selectedCategories],
  }));
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        const prefs = loadDecidePreferences();
        if (!cancelled) {
          setFilters(prefs);
        }

        try {
          const { data, error } = await getReferenceLocation();
          if (cancelled) {
            return;
          }
          const configured =
            !error &&
            data?.lat != null &&
            data.lng != null &&
            Number.isFinite(data.lat) &&
            Number.isFinite(data.lng);

          setHasReferenceLocation(configured);
        } catch {
          if (!cancelled) {
            setHasReferenceLocation(false);
          }
        }

        if (!currentGroupId) {
          if (!cancelled) {
            setCities([]);
            setDistrictsByCity({});
            setReady(true);
          }
          return;
        }

        try {
          const options = await listRestaurantLocationOptions(currentGroupId);
          if (!cancelled) {
            setCities(options.cities);
            setDistrictsByCity(options.districtsByCity);
          }
        } catch {
          if (!cancelled) {
            setCities([]);
            setDistrictsByCity({});
          }
        } finally {
          if (!cancelled) {
            setReady(true);
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [revision, currentGroupId]);

  function updateFilters(next: DecideFilters) {
    if (sameDecideFilters(next, filters)) {
      return;
    }

    setFilters(next);
    saveDecidePreferences(next);
    showToast("success", "已更新「今天吃什麼」設定。");
  }

  function handleSelectCity(raw: string) {
    const nextCity = raw.trim() || null;
    updateFilters({
      ...filters,
      city: nextCity,
      district: null,
    });
  }

  function handleSelectDistrict(raw: string) {
    const nextDistrict = raw.trim() || null;
    updateFilters({
      ...filters,
      district: nextDistrict,
    });
  }

  function handleSelectAllCategories() {
    updateFilters({
      ...filters,
      selectedCategories: [],
    });
  }

  function handleToggleCategory(category: AppCategory) {
    const isSelected = filters.selectedCategories.includes(category);
    const nextCategories = isSelected
      ? filters.selectedCategories.filter((item) => item !== category)
      : [...filters.selectedCategories, category];

    updateFilters({
      ...filters,
      selectedCategories: nextCategories,
    });
  }

  const allSelected = filters.selectedCategories.length === 0;

  const cityOptions = useMemo(() => {
    if (filters.city && !cities.includes(filters.city)) {
      return [filters.city, ...cities];
    }
    return cities;
  }, [cities, filters.city]);

  const districtOptions = useMemo(() => {
    if (!filters.city) {
      return [];
    }
    const fromCity = districtsByCity[filters.city] ?? [];
    if (filters.district && !fromCity.includes(filters.district)) {
      return [filters.district, ...fromCity];
    }
    return fromCity;
  }, [districtsByCity, filters.city, filters.district]);

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/settings"
          aria-label="返回設定"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          今天吃什麼
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4">
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-text-secondary">
            設定兔兔幫你決定餐廳時的預設條件。
            <br />
            之後首頁按下「幫我決定」時，
            <br />
            將直接套用這些設定。
          </p>
        </div>

        {!ready ? (
          <div className="mt-6 animate-pulse space-y-4" aria-hidden>
            <div className="h-24 rounded-2xl bg-border/80" />
            <div className="h-28 rounded-2xl bg-border/70" />
            <div className="h-24 rounded-2xl bg-border/60" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <FilterSection title="🟢 營業中">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-deep-brown">
                <input
                  type="checkbox"
                  checked={filters.onlyOpen}
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      onlyOpen: event.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-caramel"
                />
                排除目前未營業的餐廳
              </label>
            </FilterSection>

            <FilterSection title="🏙 城市／行政區">
              {cityOptions.length === 0 ? (
                <p className="text-sm leading-relaxed text-text-secondary">
                  目前群組還沒有可篩選的城市資料。
                  <br />
                  新增餐廳後即可使用。
                </p>
              ) : (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-deep-brown">
                      📍 城市
                    </span>
                    <select
                      value={filters.city ?? ""}
                      onChange={(event) =>
                        handleSelectCity(event.target.value)
                      }
                      className={selectClassName}
                    >
                      <option value="">全部</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-deep-brown">
                      🏘 行政區
                    </span>
                    <select
                      value={filters.district ?? ""}
                      onChange={(event) =>
                        handleSelectDistrict(event.target.value)
                      }
                      disabled={!filters.city}
                      className={`${selectClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="">全部</option>
                      {districtOptions.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </FilterSection>

            <FilterSection title="📍 距離">
              {hasReferenceLocation ? (
                <div className="flex flex-wrap gap-2">
                  {DISTANCE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={filters.maxDistanceKm === option.value}
                      onClick={() =>
                        updateFilters({
                          ...filters,
                          maxDistanceKm: option.value,
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        filters.maxDistanceKm === option.value
                          ? "border-caramel bg-sakura-pink text-deep-brown"
                          : "border-border bg-rice-white text-cocoa"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    📍 尚未設定群組預設位置。
                    <br />
                    設定後即可使用距離篩選。
                  </p>
                  <Link
                    href="/settings/location"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-caramel bg-rice-white px-5 text-sm font-bold text-caramel shadow-soft"
                  >
                    前往設定
                  </Link>
                </div>
              )}
            </FilterSection>

            <FilterSection title="❤️ 收藏">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["all", "全部餐廳"],
                    ["favorites", "我的收藏"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${
                      filters.favoriteMode === value
                        ? "border-caramel bg-sakura-pink text-deep-brown"
                        : "border-border bg-rice-white text-cocoa"
                    }`}
                  >
                    <input
                      type="radio"
                      name="favorite-mode"
                      value={value}
                      checked={filters.favoriteMode === value}
                      onChange={() =>
                        updateFilters({
                          ...filters,
                          favoriteMode: value as DecideFavoriteMode,
                        })
                      }
                      className="accent-caramel"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="🍜 分類">
              <div className="flex flex-wrap gap-2">
                <CategoryChip
                  label="✨ 全部"
                  active={allSelected}
                  onClick={handleSelectAllCategories}
                />
                {APP_CATEGORIES.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    active={filters.selectedCategories.includes(category)}
                    onClick={() => handleToggleCategory(category)}
                  />
                ))}
              </div>
            </FilterSection>
          </div>
        )}
      </section>

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
