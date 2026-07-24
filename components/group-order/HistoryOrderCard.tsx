"use client";

import Link from "next/link";

import { formatGroupOrderCompletedDate } from "@/components/group-order/groupOrderLabels";

type HistoryOrderCardProps = {
  orderId: string;
  title: string;
  restaurantName: string;
  completedAt: string | null;
  participantCount: number;
  itemCount: number;
  totalAmount: number;
};

export default function HistoryOrderCard({
  orderId,
  title,
  restaurantName,
  completedAt,
  participantCount,
  itemCount,
  totalAmount,
}: HistoryOrderCardProps) {
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
      <p className="mt-1.5 text-sm text-text-secondary">
        完成日期：
        <span className="font-medium text-[#6E4F38]">
          {formatGroupOrderCompletedDate(completedAt)}
        </span>
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-1 border-t border-dashed border-border/80 pt-2.5 text-center">
        <p className="text-[11px] text-text-secondary">
          👥 {participantCount} 人
        </p>
        <p className="text-[11px] text-text-secondary">🧋 {itemCount} 項</p>
        <p className="text-[11px] font-bold text-soft-orange">
          💰 ${totalAmount}
        </p>
      </div>
    </Link>
  );
}
