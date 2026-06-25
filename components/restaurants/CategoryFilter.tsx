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
    <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <CategoryChip
          key={item.id}
          id={item.id}
          label={item.label}
          active={value === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
    </div>
  );
}
