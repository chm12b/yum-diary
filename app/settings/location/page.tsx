import type { Metadata } from "next";

import SettingsPlaceholderPage from "@/components/settings/SettingsPlaceholderPage";

export const metadata: Metadata = {
  title: "預設位置｜Yum Diary",
};

export default function SettingsLocationRoute() {
  return <SettingsPlaceholderPage title="預設位置" />;
}
