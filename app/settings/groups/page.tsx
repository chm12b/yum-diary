import type { Metadata } from "next";

import GroupListPage from "@/components/settings/GroupListPage";

export const metadata: Metadata = {
  title: "我的群組｜Yum Diary",
};

export default function SettingsGroupsRoute() {
  return <GroupListPage />;
}
