"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CategoryFilter from "@/components/restaurants/CategoryFilter";
import RestaurantList from "@/components/restaurants/RestaurantList";
import RestaurantPageHeader from "@/components/restaurants/RestaurantPageHeader";
import TopBar from "@/components/layout/TopBar";
import SearchBar from "@/components/shared/SearchBar";
import { getFilteredRestaurants } from "@/src/lib/filter-restaurants";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantCategoryId } from "@/src/lib/restaurant-types";
import { categoryFilters, mockRestaurants } from "@/src/lib/restaurants-data";

export default function RestaurantListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] =
    useState<RestaurantCategoryId>("all");

  const filteredRestaurants = useMemo(
    () =>
      getFilteredRestaurants(
        mockRestaurants,
        searchQuery,
        activeCategoryId,
      ),
    [searchQuery, activeCategoryId],
  );

  return (
    <div className="home-grid-bg min-h-full">
      <TopBar />
      <RestaurantPageHeader />
      <section className="px-5 pb-3">
        <div className="relative">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
      <section className="px-5 pb-4">
        <CategoryFilter
          items={categoryFilters}
          value={activeCategoryId}
          onChange={setActiveCategoryId}
        />
      </section>
      <section className="px-5 pt-2 pb-8">
        <RestaurantList
          restaurants={filteredRestaurants}
          onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
        />
      </section>
    </div>
  );
}
