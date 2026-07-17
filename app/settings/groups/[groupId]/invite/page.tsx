import type { Metadata } from "next";

import GroupInvitePage from "@/components/settings/GroupInvitePage";

type GroupInviteRouteProps = {
  params: Promise<{ groupId: string }>;
};

export const metadata: Metadata = {
  title: "邀請成員｜Yum Diary",
};

export default async function GroupInviteRoute({
  params,
}: GroupInviteRouteProps) {
  const { groupId } = await params;
  return <GroupInvitePage groupId={groupId} />;
}
