import { notFound } from "next/navigation";

import DetailPage from "@/components/restaurants/detail/DetailPage";
import { getRestaurantDetailById } from "@/src/lib/restaurant-details-data";

type RestaurantDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailRoute({
  params,
}: RestaurantDetailRouteProps) {
  const { id } = await params;
  const restaurant = getRestaurantDetailById(id);

  if (!restaurant) {
    notFound();
  }

  return <DetailPage restaurant={restaurant} />;
}
