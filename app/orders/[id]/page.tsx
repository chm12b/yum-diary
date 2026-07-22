import OrderDetailPage from "@/components/group-order/OrderDetailPage";

type OrderDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function OrderDetailRoute({
  params,
}: OrderDetailRouteProps) {
  const { id } = await params;
  return <OrderDetailPage orderId={id} />;
}
