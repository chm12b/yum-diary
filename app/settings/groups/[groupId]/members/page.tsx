import type { Metadata } from "next";

import GroupMembersPage from "@/components/settings/GroupMembersPage";

type GroupMembersRouteProps = {
  params: Promise<{ groupId: string }>;
};

export const metadata: Metadata = {
  title: "成員｜Yum Diary",
};

export default async function GroupMembersRoute({
  params,
}: GroupMembersRouteProps) {
  const { groupId } = await params;
  return <GroupMembersPage groupId={groupId} />;
}
