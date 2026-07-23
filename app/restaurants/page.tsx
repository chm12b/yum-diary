import { Suspense } from "react";

import RestaurantListPage from "@/components/restaurants/RestaurantListPage";

export default function RestaurantsPage() {
  return (
    <Suspense fallback={null}>
      <RestaurantListPage />
    </Suspense>
  );
}
