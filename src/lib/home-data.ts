export type MenuItemId =
  | "all-restaurants"
  | "favorites"
  | "recently-added"
  | "recently-eaten";

export type MenuItemTrailing =
  | { type: "count"; count: number }
  | { type: "chevron" };

export type MenuItemData = {
  id: MenuItemId;
  label: string;
  trailing: MenuItemTrailing;
};

export const menuItems: MenuItemData[] = [
  {
    id: "all-restaurants",
    label: "查看所有餐廳",
    trailing: { type: "count", count: 132 },
  },
  {
    id: "favorites",
    label: "我的最愛",
    trailing: { type: "count", count: 15 },
  },
  {
    id: "recently-added",
    label: "最近新增",
    trailing: { type: "count", count: 8 },
  },
  {
    id: "recently-eaten",
    label: "最近吃過",
    trailing: { type: "chevron" },
  },
];
