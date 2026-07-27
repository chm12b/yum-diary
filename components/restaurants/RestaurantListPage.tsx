"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import RestaurantEmptyState from "@/components/home/RestaurantEmptyState";
import TopBar from "@/components/layout/TopBar";
import RestaurantFilterChips from "@/components/restaurants/RestaurantFilterChips";
import RestaurantFilterSheet from "@/components/restaurants/RestaurantFilterSheet";
import RestaurantList from "@/components/restaurants/RestaurantList";
import RestaurantListSearchBar from "@/components/restaurants/RestaurantListSearchBar";
import RestaurantPageHeader from "@/components/restaurants/RestaurantPageHeader";
import RestaurantSortMenu from "@/components/restaurants/RestaurantSortMenu";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { homeAssets } from "@/src/lib/home-assets";
import { mapRestaurantRecordToListItem } from "@/src/lib/map-restaurant-list-item";
import {
  buildFilterChips,
  clearFilterKey,
  hasActiveFilter,
} from "@/src/lib/restaurants/filter-ui";
import {
  NEARBY_QUICK_BROWSE_FILTER,
  NEARBY_QUICK_BROWSE_QUERY,
  NEARBY_QUICK_BROWSE_SORT,
} from "@/src/lib/restaurants/nearby-quick-browse";
import type { Restaurant } from "@/src/lib/restaurant-types";
import { listFavorites } from "@/src/services/favorite";
import {
  DEFAULT_RESTAURANT_SORT,
  listRestaurantLocationOptions,
  listRestaurants,
  type RestaurantFilter,
  type RestaurantSort,
} from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

const ARCHIVED_TOAST_MS = 1800;

export default function RestaurantListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { revision, currentGroupId, currentGroup, loading: groupLoading } =
    useCurrentGroup();

  const isNearbyQuickBrowse =
    searchParams.get(NEARBY_QUICK_BROWSE_QUERY) === "1";
  const showArchivedToast = searchParams.get("archived") === "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<RestaurantFilter>({});
  const [sort, setSort] = useState<RestaurantSort>(DEFAULT_RESTAURANT_SORT);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [districtsByCity, setDistrictsByCity] = useState<
    Record<string, string[]>
  >({});
  const [reloadToken, setReloadToken] = useState(0);
  const [archivedToastVisible, setArchivedToastVisible] = useState(false);
  const archivedToastTimerRef = useRef<number | null>(null);

  const referenceLat = currentGroup?.referenceLat ?? null;
  const referenceLng = currentGroup?.referenceLng ?? null;

  const referencePoint = useMemo(() => {
    if (referenceLat == null || referenceLng == null) {
      return null;
    }
    return { lat: referenceLat, lng: referenceLng };
  }, [referenceLat, referenceLng]);

  // Home「逛逛附近餐廳」→ /restaurants?nearby=1：套用預設 filter / sort。
  useEffect(() => {
    if (!isNearbyQuickBrowse) {
      return;
    }
    setFilter({ ...NEARBY_QUICK_BROWSE_FILTER });
    setSort(NEARBY_QUICK_BROWSE_SORT);
  }, [isNearbyQuickBrowse]);

  useEffect(() => {
    if (!showArchivedToast) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setArchivedToastVisible(true);
      router.replace("/restaurants");
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [showArchivedToast, router]);

  useEffect(() => {
    if (!archivedToastVisible) {
      return;
    }

    if (archivedToastTimerRef.current != null) {
      window.clearTimeout(archivedToastTimerRef.current);
    }
    archivedToastTimerRef.current = window.setTimeout(() => {
      setArchivedToastVisible(false);
      archivedToastTimerRef.current = null;
    }, ARCHIVED_TOAST_MS);

    return () => {
      if (archivedToastTimerRef.current != null) {
        window.clearTimeout(archivedToastTimerRef.current);
        archivedToastTimerRef.current = null;
      }
    };
  }, [archivedToastVisible]);

  useEffect(() => {
    if (groupLoading || !currentGroupId) {
      return;
    }

    const groupId = currentGroupId;
    let cancelled = false;

    void (async () => {
      try {
        const [options, rows, favorites] = await Promise.all([
          listRestaurantLocationOptions(groupId),
          listRestaurants({
            groupId,
            filter,
            sort,
            search: searchQuery,
            referencePoint,
          }),
          listFavorites(),
        ]);

        if (cancelled) {
          return;
        }

        const favoriteIds = new Set(
          favorites.map((favorite) => favorite.restaurantId),
        );

        setCities(options.cities);
        setDistrictsByCity(options.districtsByCity);
        setTotalCount(options.totalCount);
        setRestaurants(
          rows.map((row) =>
            mapRestaurantRecordToListItem(
              row,
              referencePoint,
              favoriteIds.has(row.id),
            ),
          ),
        );
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setRestaurants([]);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    revision,
    currentGroupId,
    groupLoading,
    filter,
    sort,
    searchQuery,
    referencePoint,
    reloadToken,
  ]);

  const chips = useMemo(() => buildFilterChips(filter), [filter]);
  const filterActive = hasActiveFilter(filter);

  const hasGroup = Boolean(currentGroupId);
  const listStatus: LoadStatus = groupLoading
    ? "loading"
    : !hasGroup
      ? "ready"
      : status;
  const listRestaurantsData = hasGroup ? restaurants : [];
  const listTotalCount = hasGroup ? totalCount : 0;

  const showEmptyCollection =
    listStatus === "ready" &&
    listTotalCount === 0 &&
    searchQuery.trim() === "" &&
    !filterActive;

  const showEmptyFiltered =
    listStatus === "ready" &&
    listTotalCount > 0 &&
    listRestaurantsData.length === 0;

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />
      <RestaurantPageHeader />

      <section className="relative px-5 pb-3">
        <div className="relative">
          <RestaurantListSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            filterActive={filterActive}
            sortOpen={sortOpen}
            onOpenFilter={() => {
              setSortOpen(false);
              setFilterOpen(true);
            }}
            onToggleSort={() => {
              setFilterOpen(false);
              setSortOpen((open) => !open);
            }}
          />
          <RestaurantSortMenu
            open={sortOpen}
            value={sort}
            onClose={() => setSortOpen(false)}
            onChange={setSort}
          />
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={32}
            height={32}
            aria-hidden
            className="pointer-events-none absolute -top-2 -right-1 rotate-12"
          />
        </div>
      </section>

      {chips.length > 0 ? (
        <section className="px-5 pb-3">
          <RestaurantFilterChips
            chips={chips}
            onRemove={(key) => {
              setFilter((current) => clearFilterKey(current, key));
            }}
          />
        </section>
      ) : null}

      <section className="px-5 pt-2 pb-8">
        {listStatus === "loading" ? (
          <div className="flex animate-pulse flex-col gap-4" aria-hidden>
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[116px] w-full rounded-[1.25rem] bg-border/80" />
          </div>
        ) : null}

        {listStatus === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-cocoa">載入餐廳失敗</p>
            <button
              type="button"
              onClick={() => {
                setReloadToken((token) => token + 1);
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {showEmptyCollection || showEmptyFiltered ? (
          <RestaurantEmptyState />
        ) : null}

        {listStatus === "ready" &&
        !showEmptyCollection &&
        !showEmptyFiltered ? (
          <RestaurantList
            restaurants={listRestaurantsData}
            onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
          />
        ) : null}
      </section>

      <RestaurantFilterSheet
        open={filterOpen}
        value={filter}
        cities={cities}
        districtsByCity={districtsByCity}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilter(next);
          setFilterOpen(false);
        }}
      />

      {archivedToastVisible ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-caramel/30 bg-sakura-pink/80 px-4 py-3 text-center text-sm font-medium text-deep-brown shadow-card"
        >
          📦 已封存餐廳。
        </div>
      ) : null}
    </div>
  );
}
