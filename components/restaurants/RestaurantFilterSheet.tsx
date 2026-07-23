"use client";

import { useEffect, useMemo, useState } from "react";

import { APP_CATEGORIES } from "@/src/lib/restaurants/category";
import {
  DISTANCE_FILTER_OPTIONS,
  OPEN_STATUS_OPTIONS,
} from "@/src/lib/restaurants/filter-ui";
import type { RestaurantFilter } from "@/src/services/restaurant";

type RestaurantFilterSheetProps = {
  open: boolean;
  value: RestaurantFilter;
  cities: string[];
  districtsByCity: Record<string, string[]>;
  onClose: () => void;
  onApply: (next: RestaurantFilter) => void;
};

const selectClassName =
  "mt-1.5 h-11 w-full appearance-none rounded-xl border border-border bg-cream-bg/60 px-3 text-sm text-deep-brown outline-none transition-colors focus:border-caramel";

type SheetBodyProps = {
  initialValue: RestaurantFilter;
  cities: string[];
  districtsByCity: Record<string, string[]>;
  onClose: () => void;
  onApply: (next: RestaurantFilter) => void;
};

function RestaurantFilterSheetBody({
  initialValue,
  cities,
  districtsByCity,
  onClose,
  onApply,
}: SheetBodyProps) {
  const [draft, setDraft] = useState<RestaurantFilter>(initialValue);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const districts = useMemo(() => {
    const city = draft.city?.trim();
    if (!city) {
      return [];
    }
    return districtsByCity[city] ?? [];
  }, [draft.city, districtsByCity]);

  function setCity(city: string) {
    const nextCity = city.trim();
    setDraft((current) => {
      const next: RestaurantFilter = { ...current };
      if (!nextCity) {
        delete next.city;
        delete next.district;
        return next;
      }
      next.city = nextCity;
      delete next.district;
      return next;
    });
  }

  function setDistrict(district: string) {
    const nextDistrict = district.trim();
    setDraft((current) => {
      const next: RestaurantFilter = { ...current };
      if (!nextDistrict) {
        delete next.district;
        return next;
      }
      next.district = nextDistrict;
      return next;
    });
  }

  function setCategory(category: string) {
    const nextCategory = category.trim();
    setDraft((current) => {
      const next: RestaurantFilter = { ...current };
      if (!nextCategory) {
        delete next.category;
        return next;
      }
      next.category = nextCategory;
      return next;
    });
  }

  function setOpenStatus(status: string) {
    setDraft((current) => {
      const next: RestaurantFilter = { ...current };
      if (!status) {
        delete next.openStatus;
        return next;
      }
      next.openStatus = status as NonNullable<RestaurantFilter["openStatus"]>;
      return next;
    });
  }

  function setMaxDistance(raw: string) {
    const meters = Number(raw);
    setDraft((current) => {
      const next: RestaurantFilter = { ...current };
      if (!Number.isFinite(meters) || meters <= 0) {
        delete next.maxDistanceMeters;
        return next;
      }
      next.maxDistanceMeters = meters;
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="關閉篩選"
        className="absolute inset-0 bg-deep-brown/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-filter-title"
        className="relative z-10 flex max-h-[min(88vh,36rem)] w-full max-w-app flex-col rounded-t-3xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-dashed border-border px-5 pt-5 pb-4">
          <h2
            id="restaurant-filter-title"
            className="text-center font-display text-base font-bold text-deep-brown"
          >
            篩選
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="text-sm font-medium text-deep-brown">📏 距離</span>
            <select
              value={draft.maxDistanceMeters ?? ""}
              onChange={(event) => setMaxDistance(event.target.value)}
              className={selectClassName}
            >
              <option value="">全部</option>
              {DISTANCE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">📍 城市</span>
            <select
              value={draft.city ?? ""}
              onChange={(event) => setCity(event.target.value)}
              className={selectClassName}
            >
              <option value="">全部</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">
              🏘 行政區
            </span>
            <select
              value={draft.district ?? ""}
              onChange={(event) => setDistrict(event.target.value)}
              disabled={!draft.city}
              className={`${selectClassName} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">全部</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">🍜 類別</span>
            <select
              value={draft.category ?? ""}
              onChange={(event) => setCategory(event.target.value)}
              className={selectClassName}
            >
              <option value="">全部</option>
              {APP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">
              🟢 營業狀態
            </span>
            <select
              value={draft.openStatus ?? ""}
              onChange={(event) => setOpenStatus(event.target.value)}
              className={selectClassName}
            >
              <option value="">全部</option>
              {OPEN_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-2.5 border-t border-dashed border-border px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setDraft({})}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg"
          >
            重設
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            套用
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantFilterSheet({
  open,
  value,
  cities,
  districtsByCity,
  onClose,
  onApply,
}: RestaurantFilterSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <RestaurantFilterSheetBody
      key={`${value.city ?? ""}-${value.district ?? ""}-${value.category ?? ""}-${value.openStatus ?? ""}-${value.maxDistanceMeters ?? ""}`}
      initialValue={value}
      cities={cities}
      districtsByCity={districtsByCity}
      onClose={onClose}
      onApply={onApply}
    />
  );
}
