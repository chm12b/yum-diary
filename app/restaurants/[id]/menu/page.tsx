import MenuBrowsePage from "@/components/menu/MenuBrowsePage";

type MenuBrowseRouteProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export default async function MenuBrowseRoute({
  params,
}: MenuBrowseRouteProps) {
  const { id } = await params;
  return <MenuBrowsePage restaurantId={id} />;
}
