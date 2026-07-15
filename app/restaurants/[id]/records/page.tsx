import RecordsPage from "@/components/records/RecordsPage";

type RestaurantRecordsRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantRecordsRoute({
  params,
}: RestaurantRecordsRouteProps) {
  const { id } = await params;

  return <RecordsPage restaurantId={id} />;
}
