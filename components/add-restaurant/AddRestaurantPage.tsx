"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AddRestaurantFooter from "@/components/add-restaurant/AddRestaurantFooter";
import AddRestaurantFormCard from "@/components/add-restaurant/AddRestaurantFormCard";
import AddRestaurantGoogleSearch from "@/components/add-restaurant/AddRestaurantGoogleSearch";
import AddRestaurantHeader from "@/components/add-restaurant/AddRestaurantHeader";
import type {
  BusinessHoursPeriodRow,
  PlaceDetailItem,
  PlacesApiResponse,
  WeeklyHoursRow,
} from "@/src/lib/google/places/types";
import {
  createEmptyPeriodRow,
  MAX_BUSINESS_HOUR_PERIODS,
  toPeriodRows,
} from "@/src/lib/restaurants/business-hours";
import { mapGoogleCategory } from "@/src/lib/restaurants/category";
import { getCurrentGroup } from "@/src/services/groups/group.service";
import {
  createRestaurant,
  type CreateRestaurantInput,
} from "@/src/services/restaurant";

const FILL_NOTICE_MS = 2000;
const SUCCESS_TOAST_MS = 1200;

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function AddRestaurantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [periods, setPeriods] = useState<BusinessHoursPeriodRow[]>(() => [
    createEmptyPeriodRow(),
  ]);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [openAllYear, setOpenAllYear] = useState(false);
  const [irregularHolidays, setIrregularHolidays] = useState(false);
  const [googlePhotoName, setGooglePhotoName] = useState<string | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [specialHours, setSpecialHours] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursRow[] | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [fillNotice, setFillNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current != null) {
        window.clearTimeout(noticeTimerRef.current);
      }
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showFillNotice() {
    setFillNotice(true);
    if (noticeTimerRef.current != null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setFillNotice(false);
      noticeTimerRef.current = null;
    }, FILL_NOTICE_MS);
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, SUCCESS_TOAST_MS);
  }

  function resetBusinessHours() {
    setPeriods([createEmptyPeriodRow()]);
    setClosedDays([]);
    setOpenAllYear(false);
    setIrregularHolidays(false);
    setSpecialHours(false);
    setWeeklyHours(null);
  }

  function applyGoogleDetail(detail: PlaceDetailItem) {
    setGooglePlaceId(detail.id);

    // Only fill blank fields — never overwrite user input.
    setName((prev) => (isBlank(prev) && detail.name ? detail.name : prev));
    setAddress((prev) =>
      isBlank(prev) && detail.address ? detail.address : prev,
    );
    setPhone((prev) => (isBlank(prev) && detail.phone ? detail.phone : prev));
    setWebsite((prev) =>
      isBlank(prev) && detail.website ? detail.website : prev,
    );
    setCategoryLabel((prev) =>
      isBlank(prev) ? mapGoogleCategory(detail.category ?? undefined) : prev,
    );

    // Always clear hours for the newly selected place (avoids stale A → B data).
    resetBusinessHours();

    if (detail.businessHours) {
      setPeriods(toPeriodRows(detail.businessHours.periods));
      setClosedDays(detail.businessHours.closedDays);
      setOpenAllYear(detail.businessHours.openAllYear);
      setIrregularHolidays(detail.businessHours.irregularHolidays);
      setSpecialHours(detail.specialHours);
      setWeeklyHours(detail.weeklyHours);
    }

    setGooglePhotoName((prev) => prev ?? detail.photo);
  }

  async function handleSelectPlaceId(placeId: string) {
    setDetailLoading(true);

    try {
      const response = await fetch(
        `/api/google/places/${encodeURIComponent(placeId)}`,
      );
      const payload = (await response.json()) as PlacesApiResponse<PlaceDetailItem>;

      if (!response.ok || payload.error || !payload.data) {
        return;
      }

      applyGoogleDetail(payload.data);
      showFillNotice();
    } catch {
      // Keep silently fail for now — form remains manually editable.
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (isBlank(name)) {
      showToast("error", "請填寫店名");
      return;
    }

    if (isBlank(categoryLabel)) {
      showToast("error", "請選擇類型");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: group, error: groupError } = await getCurrentGroup();

      if (groupError) {
        throw groupError;
      }

      if (!group?.id) {
        throw new Error("找不到目前群組，請先建立或加入群組");
      }

      const input: CreateRestaurantInput = {
        groupId: group.id,
        name: name.trim(),
        category: categoryLabel.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        note: notes.trim() || null,
        googlePlaceId: googlePlaceId?.trim() || null,
        businessHours: {
          periods: periods.map(({ open, close }) => ({ open, close })),
          closedDays,
          openAllYear,
          irregularHolidays,
        },
      };

      await createRestaurant(input);

      showToast("success", "餐廳已加入收藏！");

      await new Promise((resolve) => {
        window.setTimeout(resolve, SUCCESS_TOAST_MS);
      });

      router.back();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "新增失敗，請稍後再試";
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="home-grid-bg min-h-full">
      <AddRestaurantHeader />
      <AddRestaurantGoogleSearch
        onSelectPlaceId={handleSelectPlaceId}
        fillNotice={fillNotice}
        detailLoading={detailLoading || isSubmitting}
      />
      <AddRestaurantFormCard
        name={name}
        onNameChange={setName}
        categoryLabel={categoryLabel}
        onCategoryChange={setCategoryLabel}
        phone={phone}
        onPhoneChange={setPhone}
        website={website}
        onWebsiteChange={setWebsite}
        address={address}
        onAddressChange={setAddress}
        notes={notes}
        onNotesChange={setNotes}
        periods={periods}
        onPeriodChange={(id, patch) => {
          setPeriods((prev) =>
            prev.map((period) =>
              period.id === id ? { ...period, ...patch } : period,
            ),
          );
        }}
        onRemovePeriod={(id) => {
          setPeriods((prev) => {
            if (prev.length <= 1) {
              return prev.map((period) =>
                period.id === id
                  ? { ...period, open: "", close: "" }
                  : period,
              );
            }
            return prev.filter((period) => period.id !== id);
          });
        }}
        onAddPeriod={() => {
          setPeriods((prev) => {
            if (prev.length >= MAX_BUSINESS_HOUR_PERIODS) {
              return prev;
            }
            return [...prev, createEmptyPeriodRow()];
          });
        }}
        closedDays={closedDays}
        onToggleDay={(day) => {
          setClosedDays((prev) =>
            prev.includes(day)
              ? prev.filter((item) => item !== day)
              : [...prev, day],
          );
        }}
        openAllYear={openAllYear}
        onOpenAllYearChange={setOpenAllYear}
        irregularHolidays={irregularHolidays}
        onIrregularHolidaysChange={setIrregularHolidays}
        googlePhotoName={googlePhotoName}
        onClearGooglePhoto={() => setGooglePhotoName(null)}
        specialHours={specialHours}
        weeklyHours={weeklyHours}
      />
      <AddRestaurantFooter
        onSubmit={() => {
          void handleSubmit();
        }}
        isSubmitting={isSubmitting}
      />
      <input type="hidden" name="googlePlaceId" value={googlePlaceId ?? ""} readOnly />

      {toast ? (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-card ${
            toast.type === "success"
              ? "border border-caramel/30 bg-sakura-pink/80 text-deep-brown"
              : "border border-border bg-rice-white text-cocoa"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
