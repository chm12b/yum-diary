"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type { WeeklyHoursRow } from "@/src/lib/google/places/types";

type SpecialHoursSheetProps = {
  open: boolean;
  weeklyHours: WeeklyHoursRow[];
  onClose: () => void;
};

export default function SpecialHoursSheet({
  open,
  weeklyHours,
  onClose,
}: SpecialHoursSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-deep-brown/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="special-hours-title"
        className="relative z-10 w-full max-w-app rounded-t-3xl border border-border bg-rice-white px-5 pt-4 pb-8 shadow-card"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id="special-hours-title"
            className="text-sm font-semibold text-deep-brown"
          >
            Google 每週營業時間
          </h2>
          <button
            type="button"
            aria-label="關閉提示"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-bg text-cocoa"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <ul className="max-h-[50vh] space-y-2 overflow-y-auto rounded-2xl border border-border bg-cream-bg/50 px-3.5 py-3">
          {weeklyHours.map((row) => (
            <li
              key={row.dayLabel}
              className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/80 py-1.5 last:border-b-0"
            >
              <span className="text-[13px] font-medium text-deep-brown">
                {row.dayLabel}
              </span>
              <span className="text-right text-[13px] text-cocoa">
                {row.hoursLabel}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12px] leading-relaxed text-text-secondary">
          Google 偵測到部分日期營業時間不同，若需要可手動修改。
        </p>
      </div>
    </div>
  );
}
