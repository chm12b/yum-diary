import type { Metadata } from "next";

import FrequentRestaurantsPage from "@/components/restaurants/FrequentRestaurantsPage";

export const metadata: Metadata = {
  title: "常吃餐廳｜Yum Diary",
};

export default function FrequentRestaurantsRoute() {
  return <FrequentRestaurantsPage />;
}
