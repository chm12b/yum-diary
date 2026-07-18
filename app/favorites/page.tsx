import type { Metadata } from "next";

import FavoritePage from "@/components/favorites/FavoritePage";

export const metadata: Metadata = {
  title: "我的收藏｜Yum Diary",
};

export default function FavoritesPage() {
  return <FavoritePage />;
}
