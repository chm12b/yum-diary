"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

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

export default function DecideSettingsPage() {
  const { revision } = useCurrentGroup();
  const [ready, setReady] = useState(false);
  const [hasReferenceLocation, setHasReferenceLocation] = useState(false);
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

  async function loadReferenceLocation() {
    try {
      const { data, error } = await getReferenceLocation();
      const configured =
        !error &&
        data?.lat != null &&
        data.lng != null &&
        Number.isFinite(data.lat) &&
        Number.isFinite(data.lng);

      setHasReferenceLocation(configured);
    } catch {
      setHasReferenceLocation(false);
    }
  }

  useEffect(() => {
    const prefs = loadDecidePreferences();
    setFilters(prefs);

    const frame = window.requestAnimationFrame(() => {
      void loadReferenceLocation().finally(() => {
        setReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [revision]);

  function updateFilters(next: DecideFilters) {
    if (
      next.onlyOpen === filters.onlyOpen &&
      next.maxDistanceKm === filters.maxDistanceKm &&
      next.favoriteMode === filters.favoriteMode &&
      sameSelectedCategories(
        next.selectedCategories,
        filters.selectedCategories,
      )
    ) {
      return;
    }

    setFilters(next);
    saveDecidePreferences(next);
    showToast("success", "已更新「今天吃什麼」設定。");
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
