import { ArrowLeft, Ellipsis, Heart } from "lucide-react";
import Link from "next/link";

type DetailHeaderProps = {
  isFavorite: boolean;
  restaurantId?: string;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function DetailHeader({
  isFavorite,
  restaurantId,
}: DetailHeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href="/restaurants"
        aria-label="返回"
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
      <div />
      <div className="flex items-center gap-2 justify-self-end">
        <button type="button" aria-label="收藏" className={iconButtonClass}>
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-sakura-pink text-caramel" : "text-deep-brown"
            }`}
            strokeWidth={2}
          />
        </button>
        {restaurantId ? (
          <Link
            href={`/restaurants/${restaurantId}/edit`}
            aria-label="編輯餐廳"
            className={`${iconButtonClass} justify-self-end`}
          >
            <Ellipsis className="h-5 w-5" strokeWidth={2} />
          </Link>
        ) : (
          <button type="button" aria-label="更多" className={iconButtonClass}>
            <Ellipsis className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
