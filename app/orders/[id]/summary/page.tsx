import OrderSummaryPage from "@/components/group-order/OrderSummaryPage";

type OrderSummaryRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function OrderSummaryRoute({
  params,
}: OrderSummaryRouteProps) {
  const { id } = await params;
  return <OrderSummaryPage orderId={id} />;
}
