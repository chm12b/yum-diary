import type { Metadata } from "next";

import ProfileSettingsPage from "@/components/settings/ProfileSettingsPage";

export const metadata: Metadata = {
  title: "個人資料｜Yum Diary",
};

export default function SettingsProfileRoute() {
  return <ProfileSettingsPage />;
}
