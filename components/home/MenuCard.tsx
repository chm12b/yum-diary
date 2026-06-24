import {
  ChevronRight,
  Clock,
  Heart,
  Home,
  Star,
  type LucideIcon,
} from "lucide-react";

import type { MenuItemId, MenuItemTrailing } from "@/src/lib/home-data";

const menuIcons: Record<MenuItemId, LucideIcon> = {
  "all-restaurants": Home,
  favorites: Heart,
  "recently-added": Star,
  "recently-eaten": Clock,
};

type MenuCardProps = {
  id: MenuItemId;
  label: string;
  trailing: MenuItemTrailing;
  onClick?: () => void;
};

export default function MenuCard({
  id,
  label,
  trailing,
  onClick,
}: MenuCardProps) {
  const Icon = menuIcons[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-rice-white px-4 py-4 text-left"
    >
      <Icon className="h-5 w-5 shrink-0 text-caramel" strokeWidth={2} />
      <span className="flex-1 text-base font-medium text-deep-brown">{label}</span>
      {trailing.type === "chevron" ? (
        <ChevronRight className="h-5 w-5 shrink-0 text-cocoa" strokeWidth={2} />
      ) : (
        <span className="text-sm text-cocoa">{trailing.count} 家</span>
      )}
    </button>
  );
}
