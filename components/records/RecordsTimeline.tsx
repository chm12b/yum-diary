import DiaryCard from "@/components/records/DiaryCard";
import type { DiaryRecord } from "@/src/lib/restaurant-types";

type RecordsTimelineProps = {
  records: DiaryRecord[];
};

export default function RecordsTimeline({ records }: RecordsTimelineProps) {
  return (
    <section className="px-5 pb-28">
      <div className="relative pl-7">
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[11px] w-px border-l-2 border-dashed border-caramel/35"
        />

        <ul className="space-y-5">
          {records.map((record) => (
            <li key={record.id} className="relative">
              <span
                aria-hidden
                className="absolute top-7 -left-[17px] z-10 h-3 w-3 rounded-full border-2 border-white bg-sakura-pink shadow-soft"
              />
              <DiaryCard record={record} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
