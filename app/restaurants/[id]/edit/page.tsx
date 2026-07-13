import AddRestaurantPage from "@/components/add-restaurant/AddRestaurantPage";

type EditRestaurantRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRestaurantRoute({
  params,
}: EditRestaurantRouteProps) {
  const { id } = await params;

  return <AddRestaurantPage restaurantId={id} />;
}
