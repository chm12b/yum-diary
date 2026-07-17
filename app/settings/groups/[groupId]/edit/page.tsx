import type { Metadata } from "next";

import SettingsPlaceholderPage from "@/components/settings/SettingsPlaceholderPage";

type GroupEditRouteProps = {
  params: Promise<{ groupId: string }>;
};

export const metadata: Metadata = {
  title: "修改群組名稱｜Yum Diary",
};

export default async function GroupEditRoute({
  params,
}: GroupEditRouteProps) {
  const { groupId } = await params;
  return (
    <SettingsPlaceholderPage
      title="修改群組名稱"
      backHref={`/settings/groups/${groupId}`}
    />
  );
}
