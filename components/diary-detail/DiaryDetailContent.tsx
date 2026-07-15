import { Calendar, MessageCircle, Star } from "lucide-react";

import RecordStarRating from "@/components/records/RecordStarRating";
import { formatVisitDate } from "@/src/lib/format-visit-date";
import type { DiningRecord } from "@/src/services/record";

type DiaryDetailContentProps = {
  record: DiningRecord;
};

function FieldLabel({
  icon: Icon,
  label,
}: {
  icon: typeof Calendar;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
      <span className="text-sm font-medium text-deep-brown">{label}</span>
    </div>
  );
}

function FormDivider() {
  return <div className="border-t border-dashed border-border" />;
}

export default function DiaryDetailContent({ record }: DiaryDetailContentProps) {
  return (
    <section className="px-5 pb-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <FieldLabel icon={Calendar} label="用餐日期" />
          <span className="rounded-full border border-border bg-cream-bg px-3 py-1.5 text-xs text-deep-brown">
            {formatVisitDate(record.visit_date)}
          </span>
        </div>

        <FormDivider />

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <FieldLabel icon={Star} label="評分" />
          <RecordStarRating rating={record.rating} />
        </div>

        <FormDivider />

        <div className="space-y-2.5 px-4 py-3.5 pb-4">
          <FieldLabel icon={MessageCircle} label="心得" />
          <p className="whitespace-pre-wrap rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 text-sm leading-relaxed text-deep-brown">
            {record.notes}
          </p>
        </div>
      </div>
    </section>
  );
}
