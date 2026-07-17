import type { Metadata } from "next";

import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata: Metadata = {
  title: "重設密碼｜Yum Diary",
  description: "重新設定 Yum Diary 帳號密碼。",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
