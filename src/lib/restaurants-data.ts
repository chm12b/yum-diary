import type { CategoryFilterItem, Restaurant } from "@/src/lib/restaurant-types";

export const categoryFilters: CategoryFilterItem[] = [
  { id: "all", label: "全部" },
  { id: "japanese", label: "日式" },
  { id: "chinese", label: "中式" },
  { id: "snacks", label: "小吃" },
  { id: "coffee", label: "咖啡" },
  { id: "desserts", label: "甜點" },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "yamamoto-ramen",
    name: "山本拉麵",
    imageUrl: "/restaurants/placeholder.svg",
    rating: 4.7,
    reviewCount: 632,
    isOpen: true,
    distanceMeters: 450,
    averagePrice: 250,
    category: "japanese",
    isFavorite: false,
    lastVisited: "2026-06-10",
    notes: "湯頭濃郁，午間不用排太久。",
  },
  {
    id: "grandma-braised-pork",
    name: "阿嬤滷肉飯",
    imageUrl: "/restaurants/placeholder.svg",
    rating: 4.5,
    reviewCount: 218,
    isOpen: true,
    distanceMeters: 320,
    averagePrice: 80,
    category: "chinese",
    isFavorite: true,
    lastVisited: "2026-06-05",
    notes: "滷汁偏甜，很下飯。",
  },
  {
    id: "little-happiness-coffee",
    name: "小確幸咖啡",
    imageUrl: "/restaurants/placeholder.svg",
    rating: 4.8,
    reviewCount: 89,
    isOpen: false,
    distanceMeters: 680,
    averagePrice: 150,
    category: "coffee",
    isFavorite: false,
  },
];
