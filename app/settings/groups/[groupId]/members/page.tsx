import type { Metadata } from "next";

import SettingsPlaceholderPage from "@/components/settings/SettingsPlaceholderPage";

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
  return (
    <SettingsPlaceholderPage
      title="成員"
      backHref={`/settings/groups/${groupId}`}
    />
  );
}
