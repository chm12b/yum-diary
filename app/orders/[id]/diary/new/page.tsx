import AddDiaryPage from "@/components/add-diary/AddDiaryPage";

type NewOrderDiaryRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function NewOrderDiaryRoute({
  params,
}: NewOrderDiaryRouteProps) {
  const { id } = await params;

  return <AddDiaryPage mode="create-from-order" groupOrderId={id} />;
}
