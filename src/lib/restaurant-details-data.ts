import type { DiaryRecord, HeroImage, Restaurant, RestaurantDetail } from "@/src/lib/restaurant-types";
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
    images: createHeroImages("yamamoto-ramen", 1, "山本拉麵"),
    openingHours: {
      slots: ["11:00 - 14:00", "17:00 - 21:30"],
      todayStatusLabel: "今天營業中",
      closedDays: ["星期二"],
    },
    phoneNumber: "02-2567-8910",
    address: "台北市中山區中山北路二段162號",
    websiteUrl: "https://example.com/yamamoto-ramen",
    menuImages: [
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
    ],
    lastOrder: "豚骨拉麵 + 溏心蛋",
    myRating: 5,
    recordCount: 3,
    records: [
      {
        id: "yamamoto-ramen-record-1",
        visitDate: "2026-06-10",
        rating: 5,
        order: "豚骨拉麵 + 溏心蛋",
        notes: "湯頭很濃，叉燒很嫩，下次想試味噌！❤️",
        photo: "/restaurants/placeholder.svg",
        dateTagColor: "pink",
        orderHighlightColor: "pink",
        washiTape: "pink",
        photoRotation: 3,
      },
      {
        id: "yamamoto-ramen-record-2",
        visitDate: "2026-05-28",
        rating: 4,
        order: "味噌拉麵",
        notes: "今天人很多，等了 20 分鐘，但還是很值得！😊",
        photo: "/restaurants/placeholder.svg",
        dateTagColor: "yellow",
        orderHighlightColor: "yellow",
        washiTape: "khaki",
        photoRotation: -4,
      },
      {
        id: "yamamoto-ramen-record-3",
        visitDate: "2026-04-15",
        rating: 5,
        order: "地獄拉麵 🌶️",
        notes: "超辣🔥 辣到過癮！！下次還要再挑戰～",
        photo: "/restaurants/placeholder.svg",
        dateTagColor: "green",
        orderHighlightColor: "green",
        washiTape: "khaki",
        photoRotation: 5,
      },
    ] satisfies DiaryRecord[],
  },
  "grandma-braised-pork": {
    images: createHeroImages("grandma-braised-pork", 2, "阿嬤滷肉飯"),
    openingHours: {
      slots: ["10:30 - 14:00", "16:30 - 20:00"],
      todayStatusLabel: "今天營業中",
      closedDays: ["星期一", "星期三"],
    },
    phoneNumber: "02-8765-4321",
    address: "台北市中正區羅斯福路",
    websiteUrl: "https://example.com/grandma-braised-pork",
    menuImages: [
      "/restaurants/menu-placeholder.svg",
      "/restaurants/menu-placeholder.svg",
    ],
    lastOrder: "滷肉飯 + 冬瓜茶",
    myRating: 4,
    recordCount: 1,
    records: [
      {
        id: "grandma-braised-pork-record-1",
        visitDate: "2026-06-05",
        rating: 4,
        order: "滷肉飯 + 冬瓜茶",
        notes: "滷汁偏甜，很下飯。",
        photo: "/restaurants/placeholder.svg",
        dateTagColor: "pink",
        orderHighlightColor: "pink",
        washiTape: "pink",
        photoRotation: 2,
      },
    ] satisfies DiaryRecord[],
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
