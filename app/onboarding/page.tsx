import type { Metadata } from "next";

import OnboardingPage from "@/components/onboarding/OnboardingPage";

export const metadata: Metadata = {
  title: "開始｜Yum Diary",
  description: "歡迎來到 Yum Diary，建立或加入群組，開始收藏美食地圖。",
};

export default function OnboardingRoute() {
  return <OnboardingPage />;
}
