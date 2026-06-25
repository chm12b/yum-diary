"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CategoryFilter from "@/components/restaurants/CategoryFilter";
import RestaurantList from "@/components/restaurants/RestaurantList";
import RestaurantPageHeader from "@/components/restaurants/RestaurantPageHeader";
import SearchBar from "@/components/shared/SearchBar";
import { getFilteredRestaurants } from "@/src/lib/filter-restaurants";
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
    <>
      <RestaurantPageHeader />
      <section className="px-5 pt-2 pb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </section>
      <section className="px-5 pt-4">
        <CategoryFilter
          items={categoryFilters}
          value={activeCategoryId}
          onChange={setActiveCategoryId}
        />
      </section>
      <section className="px-5 pt-6 pb-8">
        <RestaurantList
          restaurants={filteredRestaurants}
          onRestaurantClick={(id) => router.push(`/restaurants/${id}`)}
        />
      </section>
    </>
  );
}
