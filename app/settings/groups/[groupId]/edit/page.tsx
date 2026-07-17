import type { Metadata } from "next";
import { redirect } from "next/navigation";

type GroupEditRouteProps = {
  params: Promise<{ groupId: string }>;
};

export const metadata: Metadata = {
  title: "修改群組名稱｜Yum Diary",
};

/** Rename happens in Group Detail bottom sheet — keep this route as a redirect. */
export default async function GroupEditRoute({
  params,
}: GroupEditRouteProps) {
  const { groupId } = await params;
  redirect(`/settings/groups/${groupId}`);
}
