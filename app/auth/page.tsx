import type { Metadata } from "next";

import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "登入｜Yum Diary",
  description: "登入或註冊 Yum Diary，一起收藏值得再去的餐廳。",
};

export default function AuthRoute() {
  return <AuthPage />;
}
