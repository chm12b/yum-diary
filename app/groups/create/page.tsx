import type { Metadata } from "next";

import CreateGroupPage from "@/components/groups/CreateGroupPage";

export const metadata: Metadata = {
  title: "建立群組｜Yum Diary",
  description: "輸入群組名稱，開始建立你的美食地圖。",
};

export default function CreateGroupRoute() {
  return <CreateGroupPage />;
}
