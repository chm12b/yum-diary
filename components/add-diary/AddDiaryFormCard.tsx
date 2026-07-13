"use client";

import {
  Calendar,
  Camera,
  ChevronDown,
  MessageCircle,
  Plus,
  Soup,
  Star,
} from "lucide-react";
import { useState } from "react";

import StarPicker from "@/components/add-diary/StarPicker";
import { formatVisitDate } from "@/src/lib/format-visit-date";

const ORDER_MAX = 60;
const NOTES_MAX = 200;

function FormDivider() {
  return <div className="border-t border-dashed border-border" />;
}

function RequiredTag() {
  return (
    <span className="inline-flex rounded-full bg-sakura-pink/60 px-2 py-0.5 text-[10px] font-medium text-deep-brown">
      必填
    </span>
  );
}

function FieldLabel({
  icon: Icon,
  label,
  required,
}: {
  icon: typeof Calendar;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
      <span className="text-sm font-medium text-deep-brown">{label}</span>
      {required ? <RequiredTag /> : null}
    </div>
  );
}

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddDiaryFormCard() {
  const [visitDate, setVisitDate] = useState(todayIsoDate);
  const [rating, setRating] = useState(4);
  const [order, setOrder] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <section className="px-5 pb-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <FieldLabel icon={Calendar} label="日期" />
          <label className="relative inline-flex cursor-pointer items-center rounded-full border border-border bg-cream-bg py-1.5 pr-7 pl-3 text-xs text-deep-brown">
            <span className="truncate">{formatVisitDate(visitDate)}</span>
            <ChevronDown
              className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-cocoa"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="date"
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="選擇日期"
            />
          </label>
        </div>

        <FormDivider />

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <FieldLabel icon={Star} label="我的評分" />
          <StarPicker rating={rating} onChange={setRating} />
        </div>

        <FormDivider />

        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={Soup} label="今天吃了什麼" required />
          <div className="relative">
            <textarea
              value={order}
              onChange={(event) =>
                setOrder(event.target.value.slice(0, ORDER_MAX))
              }
              rows={2}
              placeholder="例如：豚骨拉麵＋溏心蛋、味噌拉麵、唐揚雞……"
              className="w-full resize-none rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 text-sm leading-relaxed text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40"
            />
            <span className="pointer-events-none absolute right-2 bottom-2 text-[10px] text-cocoa/60">
              {order.length} / {ORDER_MAX}
            </span>
          </div>
        </div>

        <FormDivider />

        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={MessageCircle} label="心得" required />
          <div className="relative">
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value.slice(0, NOTES_MAX))
              }
              rows={5}
              placeholder={"這次的用餐體驗如何呢？\n味道、服務、環境……"}
              className="w-full resize-none rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 text-sm leading-relaxed text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40"
            />
            <span className="pointer-events-none absolute right-2 bottom-2 text-[10px] text-cocoa/60">
              {notes.length} / {NOTES_MAX}
            </span>
          </div>
        </div>

        <FormDivider />

        <div className="space-y-3 px-4 py-3.5 pb-4">
          <FieldLabel icon={Camera} label="新增照片（選填）" />
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              aria-label="新增照片"
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-caramel/50 bg-cream-bg/40 text-cocoa transition-colors hover:bg-cream-bg"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              <span className="text-[10px]">新增照片</span>
            </button>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden
                className="aspect-square rounded-xl border border-border bg-cream-bg/30"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
