"use client";

import { MessageCircle } from "lucide-react";

const NOTES_MAX = 200;

const inputClass =
  "w-full rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 text-sm text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40";

type RestaurantNotesCardProps = {
  notes: string;
  onNotesChange: (value: string) => void;
};

export default function RestaurantNotesCard({
  notes,
  onNotesChange,
}: RestaurantNotesCardProps) {
  return (
    <div className="space-y-2.5 px-4 py-3.5 pb-4">
      <div className="flex items-center gap-2">
        <MessageCircle
          className="h-4 w-4 shrink-0 text-caramel"
          strokeWidth={2}
        />
        <span className="text-sm font-medium text-deep-brown">備註</span>
        <span className="text-[10px] font-medium text-text-secondary">
          （選填）
        </span>
      </div>
      <div className="relative">
        <textarea
          value={notes}
          onChange={(event) =>
            onNotesChange(event.target.value.slice(0, NOTES_MAX))
          }
          rows={5}
          placeholder="補充這家餐廳的特色、推薦餐點或其他資訊吧～"
          className={`${inputClass} resize-none leading-relaxed`}
        />
        <span className="pointer-events-none absolute right-2 bottom-2 text-[10px] text-cocoa/60">
          {notes.length} / {NOTES_MAX}
        </span>
      </div>
    </div>
  );
}
