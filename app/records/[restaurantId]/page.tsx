import { notFound } from "next/navigation";

import RecordsPage from "@/components/records/RecordsPage";
import { getRestaurantDetailById } from "@/src/lib/restaurant-details-data";

type RecordsRouteProps = {
  params: Promise<{ restaurantId: string }>;
};

export default async function RecordsRoute({ params }: RecordsRouteProps) {
  const { restaurantId } = await params;
  const restaurant = getRestaurantDetailById(restaurantId);

  if (!restaurant) {
    notFound();
  }

  return <RecordsPage restaurant={restaurant} />;
}
