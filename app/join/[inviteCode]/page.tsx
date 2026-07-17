import type { Metadata } from "next";

import JoinInvitePage from "@/components/settings/JoinInvitePage";

type JoinInviteRouteProps = {
  params: Promise<{ inviteCode: string }>;
};

export const metadata: Metadata = {
  title: "加入群組｜Yum Diary",
};

export default async function JoinInviteRoute({
  params,
}: JoinInviteRouteProps) {
  const { inviteCode } = await params;
  return <JoinInvitePage inviteCode={inviteCode} />;
}
