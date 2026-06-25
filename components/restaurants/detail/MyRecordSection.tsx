import { Star } from "lucide-react";
import type { ReactNode } from "react";

import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type MyRecordSectionProps = {
  restaurant: RestaurantDetail;
};

type RecordRowProps = {
  label: string;
  children: ReactNode;
};

function RecordRow({ label, children }: RecordRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-sm font-medium text-deep-brown sm:w-20">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm text-cocoa">{children}</dd>
    </div>
  );
}

function MyRatingDisplay({ rating }: { rating?: number }) {
  if (rating == null) {
    return <span className="text-cocoa/60">尚未紀錄</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-caramel text-caramel"
                : "text-cocoa/30"
            }`}
            strokeWidth={2}
          />
        ))}
      </div>
      <span>{rating}</span>
    </div>
  );
}

function RecordValue({ value }: { value?: string }) {
  if (!value) {
    return <span className="text-cocoa/60">尚未紀錄</span>;
  }

  return <span className="whitespace-pre-line">{value}</span>;
}

export default function MyRecordSection({ restaurant }: MyRecordSectionProps) {
  const { myRating, lastVisited, lastOrder, notes } = restaurant;

  return (
    <section className="px-5 pt-4">
      <h2 className="mb-3 text-base font-bold text-deep-brown">我的紀錄</h2>
      <div className="rounded-2xl bg-rice-white px-4 py-4">
        <dl className="flex flex-col gap-4">
          <RecordRow label="我的評分">
            <MyRatingDisplay rating={myRating} />
          </RecordRow>
          <RecordRow label="上次吃">
            <RecordValue value={lastVisited} />
          </RecordRow>
          <RecordRow label="上次點">
            <RecordValue value={lastOrder} />
          </RecordRow>
          <RecordRow label="心得">
            <RecordValue value={notes} />
          </RecordRow>
        </dl>
      </div>
    </section>
  );
}
