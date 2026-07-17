import type { Metadata } from "next";

import GroupDetailPage from "@/components/settings/GroupDetailPage";

type GroupDetailRouteProps = {
  params: Promise<{ groupId: string }>;
};

export const metadata: Metadata = {
  title: "群組詳情｜Yum Diary",
};

export default async function GroupDetailRoute({
  params,
}: GroupDetailRouteProps) {
  const { groupId } = await params;
  return <GroupDetailPage groupId={groupId} />;
}
