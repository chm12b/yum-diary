import type { Metadata } from "next";

import LocationSettingsPage from "@/components/settings/LocationSettingsPage";

export const metadata: Metadata = {
  title: "預設位置｜Yum Diary",
};

export default function SettingsLocationRoute() {
  return <LocationSettingsPage />;
}
