import MyOrderPage from "@/components/group-order/MyOrderPage";

type MyOrderRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function MyOrderRoute({ params }: MyOrderRouteProps) {
  const { id } = await params;
  return <MyOrderPage orderId={id} />;
}
