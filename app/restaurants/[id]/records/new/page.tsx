import AddDiaryPage from "@/components/add-diary/AddDiaryPage";

type AddRestaurantRecordRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AddRestaurantRecordRoute({
  params,
}: AddRestaurantRecordRouteProps) {
  const { id } = await params;

  return <AddDiaryPage restaurantId={id} />;
}
