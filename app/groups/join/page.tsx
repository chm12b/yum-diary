import type { Metadata } from "next";

import JoinGroupPage from "@/components/groups/JoinGroupPage";

export const metadata: Metadata = {
  title: "加入群組｜Yum Diary",
  description: "輸入邀請碼，加入現有的美食地圖。",
};

export default function JoinGroupRoute() {
  return <JoinGroupPage />;
}
