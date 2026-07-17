import type { Metadata } from "next";

import ForgotPasswordPage from "@/components/auth/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "忘記密碼｜Yum Diary",
  description: "輸入 Email，寄送重設密碼信。",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
