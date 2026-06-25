import type { HeroImage, Restaurant, RestaurantDetail } from "@/src/lib/restaurant-types";
import { mockRestaurants } from "@/src/lib/restaurants-data";

type RestaurantDetailFields = Omit<RestaurantDetail, keyof Restaurant>;

function createHeroImages(
  restaurantId: string,
  count: number,
  alt: string,
): HeroImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${restaurantId}-hero-${index + 1}`,
    url: "/restaurants/placeholder.svg",
    alt,
  }));
}

const restaurantDetails: Record<string, RestaurantDetailFields> = {
  "yamamoto-ramen": {
    images: createHeroImages("yamamoto-ramen", 4, "山本拉麵"),
    openingHours: {
      slots: ["11:00 - 14:00", "17:00 - 20:30"],
      todayStatusLabel: "今天營業中",
    },
    phoneNumber: "02-1234-5678",
    address: "台北市大安區復興南路一段",
    menuImages: [
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
    ],
    lastOrder: "豚骨拉麵 + 溏心蛋",
    myRating: 5,
  },
  "grandma-braised-pork": {
    images: createHeroImages("grandma-braised-pork", 2, "阿嬤滷肉飯"),
    openingHours: {
      slots: ["10:30 - 14:00", "16:30 - 20:00"],
      todayStatusLabel: "今天營業中",
    },
    phoneNumber: "02-8765-4321",
    address: "台北市中正區羅斯福路",
    menuImages: [
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
    ],
    lastOrder: "滷肉飯 + 冬瓜茶",
    myRating: 4,
  },
};

export function getRestaurantDetailById(
  id: string,
): RestaurantDetail | undefined {
  const restaurant = mockRestaurants.find((item) => item.id === id);
  const detail = restaurantDetails[id];

  if (!restaurant || !detail) {
    return undefined;
  }

  return {
    ...restaurant,
    ...detail,
  };
}
