import { ArrowLeft, Ellipsis, Heart } from "lucide-react";
import Link from "next/link";

type DetailHeaderProps = {
  isFavorite: boolean;
};

export default function DetailHeader({ isFavorite }: DetailHeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href="/restaurants"
        aria-label="返回"
        className="flex h-10 w-10 items-center justify-center justify-self-start text-deep-brown"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={2} />
      </Link>
      <div />
      <div className="flex items-center justify-self-end">
        <button
          type="button"
          aria-label="收藏"
          className="flex h-10 w-10 items-center justify-center text-deep-brown"
        >
          <Heart
            className={`h-6 w-6 ${
              isFavorite ? "fill-caramel text-caramel" : "text-deep-brown"
            }`}
            strokeWidth={2}
          />
        </button>
        <button
          type="button"
          aria-label="更多"
          className="flex h-10 w-10 items-center justify-center text-deep-brown"
        >
          <Ellipsis className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
