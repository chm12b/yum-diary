import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export type ArchivedRestaurantCardData = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  archivedAt: string;
};

type ArchivedRestaurantCardProps = {
  restaurant: ArchivedRestaurantCardData;
  onOpen?: () => void;
  onRestore?: () => void;
  restoreDisabled?: boolean;
};

function formatArchivedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export default function ArchivedRestaurantCard({
  restaurant,
  onOpen,
  onRestore,
  restoreDisabled = false,
}: ArchivedRestaurantCardProps) {
  return (
    <article className="relative flex w-full flex-col gap-3 rounded-[1.25rem] border border-border bg-rice-white px-3 pt-3 pb-3 text-left shadow-soft">
      <div className="relative flex gap-3">
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`查看 ${restaurant.name}`}
            className="absolute inset-0 rounded-[1.25rem]"
          />
        ) : null}

        <div className="pointer-events-none relative z-10 shrink-0">
          <div className="h-[100px] w-[120px] rounded-xl border-[3px] border-white bg-white p-1 shadow-soft">
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={restaurant.imageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={40}
            height={40}
            aria-hidden
            className="pointer-events-none absolute -right-1.5 bottom-2 h-10 w-10 translate-x-[0.3rem] translate-y-0 object-contain"
          />
        </div>

        <div className="pointer-events-none relative z-10 flex min-h-[100px] min-w-0 flex-1 flex-col gap-1.5 pr-2">
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 flex-1 truncate font-bold text-deep-brown">
              {restaurant.name}
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-sakura-pink/50 px-2 py-0.5 text-[10px] font-bold text-deep-brown">
              📦 已封存
            </span>
          </div>
          <p className="truncate text-xs text-cocoa">{restaurant.category}</p>
          <p className="text-xs text-text-secondary">
            封存日期：{formatArchivedDate(restaurant.archivedAt)}
          </p>
        </div>
      </div>

      {onRestore ? (
        <button
          type="button"
          onClick={onRestore}
          disabled={restoreDisabled}
          className="relative z-20 flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-caramel/50 bg-rice-white text-sm font-bold text-deep-brown shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.99] disabled:opacity-55"
        >
          <span aria-hidden>↩️</span>
          恢復餐廳
        </button>
      ) : null}
    </article>
  );
}
