import type { Restaurant } from "@/src/lib/restaurant-types";

export function filterRestaurantsBySearch(
  restaurants: Restaurant[],
  searchQuery: string,
): Restaurant[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (normalizedQuery === "") {
    return restaurants;
  }

  return restaurants.filter((restaurant) => {
    const categoryText = restaurant.category;
    const tagText = restaurant.tags.join(" ");

    return (
      restaurant.name.toLowerCase().includes(normalizedQuery) ||
      categoryText.toLowerCase().includes(normalizedQuery) ||
      tagText.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function filterRestaurantsByCategory(
  restaurants: Restaurant[],
  categoryId: string,
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
  categoryId: string,
): Restaurant[] {
  const searchFiltered = filterRestaurantsBySearch(restaurants, searchQuery);

  return filterRestaurantsByCategory(searchFiltered, categoryId);
}
