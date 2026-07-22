import MenuManagePage from "@/components/menu/MenuManagePage";

type MenuManageRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function MenuManageRoute({
  params,
}: MenuManageRouteProps) {
  const { id } = await params;
  return <MenuManagePage restaurantId={id} />;
}
