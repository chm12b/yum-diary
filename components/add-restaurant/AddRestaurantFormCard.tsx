"use client";

import {
  BookOpen,
  CalendarOff,
  Camera,
  ChevronDown,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import SpecialHoursSheet from "@/components/add-restaurant/SpecialHoursSheet";
import TimePicker24 from "@/components/add-restaurant/TimePicker24";
import type {
  BusinessHoursPeriodRow,
  WeeklyHoursRow,
} from "@/src/lib/google/places/types";
import { MAX_BUSINESS_HOUR_PERIODS } from "@/src/lib/restaurants/business-hours";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

const NOTES_MAX = 200;

export const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"] as const;

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

function OptionalTag() {
  return (
    <span className="text-[10px] font-medium text-text-secondary">（選填）</span>
  );
}

function FieldLabel({
  icon: Icon,
  label,
  required,
  optional,
  hint,
  trailing,
}: {
  icon: typeof Camera;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
      <span className="text-sm font-medium text-deep-brown">{label}</span>
      {required ? <RequiredTag /> : null}
      {optional ? <OptionalTag /> : null}
      {hint ? (
        <span className="text-[10px] text-text-secondary">{hint}</span>
      ) : null}
      {trailing}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 text-sm text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40";

export type AddRestaurantFormCardProps = {
  name: string;
  onNameChange: (value: string) => void;
  categoryLabel: string;
  onCategoryChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  periods: BusinessHoursPeriodRow[];
  onPeriodChange: (
    id: string,
    patch: Partial<Pick<BusinessHoursPeriodRow, "open" | "close">>,
  ) => void;
  onRemovePeriod: (id: string) => void;
  onAddPeriod: () => void;
  closedDays: string[];
  onToggleDay: (day: string) => void;
  openAllYear: boolean;
  onOpenAllYearChange: (value: boolean) => void;
  irregularHolidays: boolean;
  onIrregularHolidaysChange: (value: boolean) => void;
  /** Google photo resource name for preview only (no Storage). */
  googlePhotoName: string | null;
  onClearGooglePhoto: () => void;
  specialHours?: boolean;
  weeklyHours?: WeeklyHoursRow[] | null;
};

export default function AddRestaurantFormCard({
  name,
  onNameChange,
  categoryLabel,
  onCategoryChange,
  phone,
  onPhoneChange,
  website,
  onWebsiteChange,
  address,
  onAddressChange,
  notes,
  onNotesChange,
  periods,
  onPeriodChange,
  onRemovePeriod,
  onAddPeriod,
  closedDays,
  onToggleDay,
  openAllYear,
  onOpenAllYearChange,
  irregularHolidays,
  onIrregularHolidaysChange,
  googlePhotoName,
  onClearGooglePhoto,
  specialHours = false,
  weeklyHours = null,
}: AddRestaurantFormCardProps) {
  const [specialHoursOpen, setSpecialHoursOpen] = useState(false);
  const photoPreviewUrl = googlePhotoName
    ? `/api/google/places/photo?name=${encodeURIComponent(googlePhotoName)}`
    : null;
  const showSpecialHoursWarning =
    specialHours && weeklyHours != null && weeklyHours.length > 0;
  const canAddPeriod = periods.length < MAX_BUSINESS_HOUR_PERIODS;

  return (
    <section className="px-5 pb-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        {/* Store photo */}
        <div className="space-y-3 px-4 py-3.5">
          <FieldLabel icon={Camera} label="店家照片" optional />
          {photoPreviewUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-cream-bg/40">
              {/* eslint-disable-next-line @next/next/no-img-element -- Google preview proxy URL */}
              <img
                src={photoPreviewUrl}
                alt="Google 店家照片預覽"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-deep-brown/55 px-3 py-2">
                <span className="text-[11px] text-rice-white">
                  Google Maps 預覽（尚未儲存）
                </span>
                <button
                  type="button"
                  onClick={onClearGooglePhoto}
                  className="text-[11px] font-medium text-sakura-pink"
                >
                  移除
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              aria-label="上傳店家照片"
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-caramel/50 bg-cream-bg/40 px-4 py-10 text-cocoa transition-colors hover:bg-cream-bg"
            >
              <Plus className="h-7 w-7" strokeWidth={2} />
              <span className="text-sm font-medium text-deep-brown">
                上傳店家照片
              </span>
              <span className="text-[11px] text-text-secondary">
                建議使用店面或招牌照片
              </span>
            </button>
          )}
        </div>

        <FormDivider />

        {/* Name */}
        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={Soup} label="店名" required />
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="請輸入店名"
            className={inputClass}
          />
        </div>

        <FormDivider />

        {/* Category select */}
        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={UtensilsCrossed} label="類型" required />
          <button
            type="button"
            aria-label="選擇餐廳類型"
            className={`relative flex w-full items-center rounded-xl border border-border bg-cream-bg/60 px-3 py-2.5 pr-9 text-left text-sm focus:outline-none focus:ring-1 focus:ring-caramel/40 ${
              categoryLabel ? "text-deep-brown" : "text-cocoa/50"
            }`}
          >
            {categoryLabel || "選擇餐廳類型"}
            <ChevronDown
              className="pointer-events-none absolute right-3 h-4 w-4 text-cocoa"
              strokeWidth={2}
              aria-hidden
            />
            <select
              value={categoryLabel}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="選擇餐廳類型"
            >
              <option value="">選擇餐廳類型</option>
              {APP_CATEGORIES.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </button>
        </div>

        <FormDivider />

        {/* Hours + closed days — side by side */}
        <div className="grid grid-cols-2 gap-3 px-4 py-3.5">
          <div className="min-w-0 space-y-2.5">
            <FieldLabel
              icon={Clock}
              label="營業時間"
              optional
              trailing={
                showSpecialHoursWarning ? (
                  <button
                    type="button"
                    aria-label="查看 Google 完整營業時間"
                    onClick={() => setSpecialHoursOpen(true)}
                    className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-khaki/80 text-[11px] text-cocoa transition-colors hover:bg-caramel/30"
                  >
                    ⚠️
                  </button>
                ) : null
              }
            />
            <div className="space-y-2">
              {periods.map((period, index) => (
                <div key={period.id} className="flex items-center gap-1">
                  <TimePicker24
                    value={period.open}
                    onChange={(open) => onPeriodChange(period.id, { open })}
                    aria-label={`時段 ${index + 1} 開始時間`}
                  />
                  <span className="shrink-0 text-[10px] text-cocoa">～</span>
                  <TimePicker24
                    value={period.close}
                    onChange={(close) => onPeriodChange(period.id, { close })}
                    aria-label={`時段 ${index + 1} 結束時間`}
                  />
                  <button
                    type="button"
                    aria-label={`刪除時段 ${index + 1}`}
                    onClick={() => onRemovePeriod(period.id)}
                    className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sakura-pink/70 text-deep-brown"
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              {canAddPeriod ? (
                <button
                  type="button"
                  onClick={onAddPeriod}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-caramel"
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                  新增時段
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 space-y-2.5">
            <FieldLabel icon={CalendarOff} label="公休日" optional />
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const active = closedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggleDay(day)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                      active
                        ? "border-caramel bg-sakura-pink text-deep-brown"
                        : "border-border bg-cream-bg/60 text-cocoa"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 text-[11px] text-deep-brown">
                <input
                  type="checkbox"
                  checked={openAllYear}
                  onChange={(event) =>
                    onOpenAllYearChange(event.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-caramel"
                />
                全年無休
              </label>
              <label className="flex items-center gap-2 text-[11px] text-deep-brown">
                <input
                  type="checkbox"
                  checked={irregularHolidays}
                  onChange={(event) =>
                    onIrregularHolidaysChange(event.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-caramel"
                />
                公休日不固定
              </label>
            </div>
          </div>
        </div>

        <FormDivider />

        {/* Phone */}
        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={Phone} label="電話" optional />
          <input
            type="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="請輸入電話號碼"
            className={inputClass}
          />
        </div>

        <FormDivider />

        {/* Website */}
        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={Globe} label="Website" optional />
          <input
            type="url"
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
            placeholder="https://"
            className={inputClass}
          />
        </div>

        <FormDivider />

        {/* Address */}
        <div className="space-y-2.5 px-4 py-3.5">
          <FieldLabel icon={MapPin} label="地址" optional />
          <input
            type="text"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder="請輸入地址"
            className={inputClass}
          />
        </div>

        <FormDivider />

        {/* Menu photos — never autofilled */}
        <div className="space-y-3 px-4 py-3.5">
          <FieldLabel
            icon={BookOpen}
            label="菜單"
            optional
            hint="可上傳多張菜單照片"
          />
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              aria-label="上傳菜單照片"
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-caramel/50 bg-cream-bg/40 text-cocoa transition-colors hover:bg-cream-bg"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              <span className="text-[10px]">上傳照片</span>
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

        <FormDivider />

        {/* Notes — never autofilled */}
        <div className="space-y-2.5 px-4 py-3.5 pb-4">
          <FieldLabel icon={MessageCircle} label="備註" optional />
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
      </div>

      {showSpecialHoursWarning && weeklyHours ? (
        <SpecialHoursSheet
          open={specialHoursOpen}
          weeklyHours={weeklyHours}
          onClose={() => setSpecialHoursOpen(false)}
        />
      ) : null}
    </section>
  );
}
