import type { Metadata } from "next";

import DecidePage from "@/components/decide/DecidePage";

export const metadata: Metadata = {
  title: "今天吃什麼？｜Yum Diary",
};

export default function DecideRoute() {
  return <DecidePage />;
}
