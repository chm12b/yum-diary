import {
  Cake,
  Coffee,
  Fish,
  LayoutGrid,
  Sandwich,
  Soup,
  type LucideIcon,
} from "lucide-react";

import type { RestaurantCategoryId } from "@/src/lib/restaurant-types";

const categoryIcons: Record<RestaurantCategoryId, LucideIcon> = {
  all: LayoutGrid,
  japanese: Fish,
  chinese: Soup,
  snacks: Sandwich,
  coffee: Coffee,
  desserts: Cake,
};

type CategoryChipProps = {
  id: RestaurantCategoryId;
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function CategoryChip({
  id,
  label,
  active,
  onClick,
}: CategoryChipProps) {
  const Icon = categoryIcons[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 flex-col items-center gap-2"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          active ? "bg-caramel text-white" : "bg-rice-white text-caramel"
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <span
        className={`text-xs ${
          active ? "font-medium text-deep-brown" : "text-cocoa"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
