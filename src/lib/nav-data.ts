export type NavItemId = "home" | "restaurants" | "favorites" | "profile";

export type NavItemData = {
  id: NavItemId;
  label: string;
  href: string;
};

export const navItems: NavItemData[] = [
  { id: "home", label: "首頁", href: "/" },
  { id: "restaurants", label: "餐廳", href: "/restaurants" },
  { id: "favorites", label: "收藏", href: "/favorites" },
  { id: "profile", label: "我的", href: "/profile" },
];
