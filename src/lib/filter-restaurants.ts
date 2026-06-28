import type {
  Restaurant,
  RestaurantCategoryId,
} from "@/src/lib/restaurant-types";
import { categoryFilters } from "@/src/lib/restaurants-data";

function getCategoryLabel(
  category: Restaurant["category"],
): string | undefined {
  return categoryFilters.find((item) => item.id === category)?.label;
}

export function filterRestaurantsBySearch(
  restaurants: Restaurant[],
  searchQuery: string,
): Restaurant[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (normalizedQuery === "") {
    return restaurants;
  }

  return restaurants.filter((restaurant) => {
    const categoryLabel = getCategoryLabel(restaurant.category) ?? "";
    const tagText = restaurant.tags.join(" ");

    return (
      restaurant.name.toLowerCase().includes(normalizedQuery) ||
      categoryLabel.toLowerCase().includes(normalizedQuery) ||
      tagText.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function filterRestaurantsByCategory(
  restaurants: Restaurant[],
  categoryId: RestaurantCategoryId,
): Restaurant[] {
  if (categoryId === "all") {
    return restaurants;
  }

  return restaurants.filter(
    (restaurant) => restaurant.category === categoryId,
  );
}

export function getFilteredRestaurants(
  restaurants: Restaurant[],
  searchQuery: string,
  categoryId: RestaurantCategoryId,
): Restaurant[] {
  const searchFiltered = filterRestaurantsBySearch(restaurants, searchQuery);

  return filterRestaurantsByCategory(searchFiltered, categoryId);
}
