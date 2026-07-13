import DetailPage from "@/components/restaurants/detail/DetailPage";

type RestaurantDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailRoute({
  params,
}: RestaurantDetailRouteProps) {
  const { id } = await params;

  return <DetailPage restaurantId={id} />;
}
