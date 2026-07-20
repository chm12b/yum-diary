import type { Metadata } from "next";

import DecideSettingsPage from "@/components/settings/DecideSettingsPage";

export const metadata: Metadata = {
  title: "今天吃什麼｜Yum Diary",
};

export default function SettingsDecideRoute() {
  return <DecideSettingsPage />;
}
