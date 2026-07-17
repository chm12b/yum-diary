import type { Metadata } from "next";

import AboutPage from "@/components/settings/AboutPage";

export const metadata: Metadata = {
  title: "關於｜Yum Diary",
};

export default function AboutRoute() {
  return <AboutPage />;
}
