"use client";

import Link from "next/link";

import { formatGroupOrderDeadlineLabel } from "@/components/group-order/groupOrderLabels";

type ActiveOrderCardProps = {
  orderId: string;
  title: string;
  restaurantName: string;
  closeAt: string;
};

export default function ActiveOrderCard({
  orderId,
  title,
  restaurantName,
  closeAt,
}: ActiveOrderCardProps) {
  return (
    <Link
      href={`/orders/${orderId}`}
      className="block rounded-[1.25rem] border border-border bg-rice-white px-4 py-3.5 shadow-soft transition-transform active:scale-[0.99]"
    >
      <p className="truncate text-xs font-medium text-text-secondary">
        {restaurantName}
      </p>
      <p className="mt-0.5 truncate font-display text-[15px] font-bold text-[#6E4F38]">
        {title}
      </p>
      <p className="mt-1.5 flex items-center gap-1 text-sm text-text-secondary">
        <span aria-hidden>🕒</span>
        <span>
          截止：
          <span className="font-semibold text-soft-orange">
            {formatGroupOrderDeadlineLabel(closeAt)}
          </span>
        </span>
      </p>
    </Link>
  );
}
