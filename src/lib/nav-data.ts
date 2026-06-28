export type NavItemId =
  | "home"
  | "restaurants"
  | "add"
  | "favorites"
  | "profile";

export type NavItemData = {
  id: NavItemId;
  label: string;
  href?: string;
  iconSrc?: string;
  isFab?: boolean;
};

export const navItems: NavItemData[] = [
  {
    id: "home",
    label: "首頁",
    href: "/",
    iconSrc: "/home/nav-home.png",
  },
  {
    id: "restaurants",
    label: "餐廳",
    href: "/restaurants",
    iconSrc: "/home/nav-restaurants.png",
  },
  {
    id: "add",
    label: "新增",
    isFab: true,
  },
  {
    id: "favorites",
    label: "收藏",
    href: "/favorites",
    iconSrc: "/home/nav-favorites.png",
  },
  {
    id: "profile",
    label: "我的",
    href: "/profile",
    iconSrc: "/home/nav-profile.png",
  },
];
