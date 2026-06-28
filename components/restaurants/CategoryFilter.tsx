import { ChevronDown } from "lucide-react";

import CategoryChip from "@/components/restaurants/CategoryChip";
import type {
  CategoryFilterItem,
  RestaurantCategoryId,
} from "@/src/lib/restaurant-types";

type CategoryFilterProps = {
  items: CategoryFilterItem[];
  value: RestaurantCategoryId;
  onChange: (value: RestaurantCategoryId) => void;
};

export default function CategoryFilter({
  items,
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.label}
            active={value === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
      <ChevronDown
        className="h-5 w-5 shrink-0 text-cocoa"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}
