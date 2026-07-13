import { notFound } from "next/navigation";

import DecideResultPage from "@/components/decide/DecideResultPage";
import { getRestaurantDetailById } from "@/src/lib/restaurant-details-data";

type DecideResultRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function DecideResultRoute({
  params,
}: DecideResultRouteProps) {
  const { id } = await params;
  const restaurant = getRestaurantDetailById(id);

  if (!restaurant) {
    notFound();
  }

  return <DecideResultPage restaurant={restaurant} />;
}
