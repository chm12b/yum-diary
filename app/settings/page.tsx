import type { Metadata } from "next";

import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "設定｜Yum Diary",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
