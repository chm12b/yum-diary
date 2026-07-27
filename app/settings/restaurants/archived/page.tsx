import type { Metadata } from "next";

import ArchivedRestaurantsPage from "@/components/settings/ArchivedRestaurantsPage";

export const metadata: Metadata = {
  title: "已封存餐廳｜Yum Diary",
};

export default function SettingsArchivedRestaurantsRoute() {
  return <ArchivedRestaurantsPage />;
}
