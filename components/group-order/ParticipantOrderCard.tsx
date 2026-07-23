"use client";

type GroupOrderLineItem = {
  name: string;
  customization?: string | null;
  price: number;
};

export type ParticipantOrderCardProps = {
  displayName: string;
  isHost?: boolean;
  isCurrentUser?: boolean;
  /** Whether the current user has joined this group order. */
  hasJoined?: boolean;
  items: GroupOrderLineItem[];
  onEditOrder?: () => void;
  editDisabled?: boolean;
  joining?: boolean;
};

function formatPrice(price: number): string {
  return `$ ${price}`;
}

export default function ParticipantOrderCard({
  displayName,
  isHost = false,
  isCurrentUser = false,
  hasJoined = true,
  items,
  onEditOrder,
  editDisabled = false,
  joining = false,
}: ParticipantOrderCardProps) {
  const itemCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const hasItems = itemCount > 0;
  const showJoinCta = isCurrentUser && !hasJoined;

  return (
    <article
      className={`relative overflow-hidden rounded-[1.35rem] border border-border px-4 pt-4 pb-4 shadow-soft ${
        isCurrentUser ? "bg-warm-gray/70" : "bg-rice-white"
      }`}
    >
      {isCurrentUser ? (
        <span className="absolute top-0 left-0 rounded-br-2xl bg-soft-orange px-2.5 py-1 text-[11px] font-bold tracking-wide text-rice-white">
          我的訂單
        </span>
      ) : null}

      <div
        className={`flex items-center justify-between gap-3 ${
          isCurrentUser ? "mt-[15px]" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-base leading-none" aria-hidden>
            👤
          </span>
          <p className="truncate font-display text-[15px] font-bold text-[#6E4F38]">
            {isCurrentUser
              ? isHost
                ? "我（Host）"
                : "我"
              : displayName}
          </p>
          {isHost ? (
            <span className="text-sm leading-none" aria-label="Host" title="Host">
              👑
            </span>
          ) : null}
        </div>
        <p className="shrink-0 text-sm text-text-secondary">
          {itemCount} 項
        </p>
      </div>

      {hasItems ? (
        <ul className="mt-3 flex flex-col gap-2.5 border-t border-dashed border-border/80 pt-3">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-start justify-between gap-3"
            >
              <p className="min-w-0 text-[15px] leading-snug text-[#6E4F38]">
                <span className="font-medium">{item.name}</span>
                {item.customization?.trim() ? (
                  <span className="text-sm text-text-secondary">
                    {" "}
                    ({item.customization.trim()})
                  </span>
                ) : null}
              </p>
              <span className="shrink-0 text-[15px] font-medium text-[#6E4F38]">
                {formatPrice(item.price)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[5px] rounded-2xl border border-dashed border-border bg-rice-white/70 px-3 py-5 text-center text-sm text-text-secondary">
          {showJoinCta ? "尚未加入此次點餐。" : "尚未點餐"}
        </p>
      )}

      {hasItems ? (
        <p className="mt-3 text-right text-[15px] font-bold text-soft-orange">
          小計 {formatPrice(subtotal)}
        </p>
      ) : null}

      {isCurrentUser ? (
        <button
          type="button"
          onClick={onEditOrder}
          disabled={editDisabled || joining}
          className="mt-[5px] flex h-12 w-full items-center justify-center rounded-full border border-caramel/50 bg-rice-white text-[15px] font-bold text-[#6E4F38] shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {joining
            ? "加入中…"
            : showJoinCta
              ? "＋ 開始點餐"
              : "＋ 修改我的餐點"}
        </button>
      ) : null}
    </article>
  );
}
