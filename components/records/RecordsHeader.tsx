import { ArrowLeft, Ellipsis } from "lucide-react";
import Link from "next/link";

import { getCategoryEmoji } from "@/src/lib/category-emoji";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type RecordsHeaderProps = {
  restaurant: RestaurantDetail;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function RecordsHeader({ restaurant }: RecordsHeaderProps) {
  const emoji = getCategoryEmoji(restaurant.category);

  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href={`/restaurants/${restaurant.id}`}
        aria-label="返回餐廳詳情"
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
      <h1 className="truncate text-center text-sm font-bold text-deep-brown">
        {emoji} {restaurant.name}
      </h1>
      <button
        type="button"
        aria-label="更多"
        className={`${iconButtonClass} justify-self-end`}
      >
        <Ellipsis className="h-5 w-5" strokeWidth={2} />
      </button>
    </header>
  );
}
