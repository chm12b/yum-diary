"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AddRestaurantBunnyHero from "@/components/add-restaurant/AddRestaurantBunnyHero";
import AddRestaurantFooter from "@/components/add-restaurant/AddRestaurantFooter";
import AddRestaurantFormCard, {
  FormDivider,
} from "@/components/add-restaurant/AddRestaurantFormCard";
import AddRestaurantGoogleSearch from "@/components/add-restaurant/AddRestaurantGoogleSearch";
import AddRestaurantHeader from "@/components/add-restaurant/AddRestaurantHeader";
import EditMenuEntrySection from "@/components/add-restaurant/EditMenuEntrySection";
import MenuManagerSection from "@/components/add-restaurant/MenuManagerSection";
import MenuItemsImportPanel from "@/components/add-restaurant/MenuItemsImportPanel";
import RestaurantNotesCard from "@/components/add-restaurant/RestaurantNotesCard";
import WizardMenuStepFooter from "@/components/add-restaurant/WizardMenuStepFooter";
import WizardStepProgress from "@/components/add-restaurant/WizardStepProgress";
import type {
  BusinessHoursPeriodRow,
  PlaceDetailItem,
  PlacesApiResponse,
  WeeklyHoursRow,
} from "@/src/lib/google/places/types";
import {
  createEmptyPeriodRow,
  MAX_BUSINESS_HOUR_PERIODS,
  parseBusinessHoursForForm,
  toPeriodRows,
} from "@/src/lib/restaurants/business-hours";
import { mapGoogleCategory } from "@/src/lib/restaurants/category";
import { getCurrentGroup } from "@/src/services/groups/group.service";
import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  type CreateRestaurantInput,
  type UpdateRestaurantInput,
} from "@/src/services/restaurant";
import { uploadRestaurantCover } from "@/src/services/restaurant-cover";

const FILL_NOTICE_MS = 2000;
const SUCCESS_TOAST_MS = 1200;

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function resolveSaveErrorMessage(error: unknown, isEdit: boolean): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  ) {
    return "此餐廳已存在於目前群組。";
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    (error as { message: string }).message.trim()
  ) {
    const raw = (error as { message: string }).message;
    if (
      raw.toLowerCase().includes("duplicate") ||
      raw.toLowerCase().includes("unique")
    ) {
      return "此餐廳已存在於目前群組。";
    }
  }

  return isEdit ? "更新失敗，請稍後再試" : "新增失敗，請稍後再試";
}

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type AddRestaurantPageProps = {
  restaurantId?: string;
};

export default function AddRestaurantPage({
  restaurantId,
}: AddRestaurantPageProps) {
  const router = useRouter();
  const isEdit = Boolean(restaurantId);

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
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [googleRatingCount, setGoogleRatingCount] = useState<number | null>(
    null,
  );
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [specialHours, setSpecialHours] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursRow[] | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [fillNotice, setFillNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(
    null,
  );
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

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    let cancelled = false;

    async function loadRestaurant() {
      setIsLoadingRestaurant(true);
      setLoadError(null);

      try {
        const row = await getRestaurant(restaurantId!);

        if (cancelled) {
          return;
        }

        if (!row) {
          setLoadError("找不到這間餐廳");
          setIsLoadingRestaurant(false);
          return;
        }

        const hours = parseBusinessHoursForForm(row.business_hours);

        setName(row.name);
        setCategoryLabel(row.category);
        setPhone(row.phone ?? "");
        setWebsite(row.website_url ?? "");
        setAddress(row.address ?? "");
        setNotes(row.notes ?? "");
        setPeriods(hours.periods);
        setClosedDays(hours.closedDays);
        setOpenAllYear(hours.openAllYear);
        setIrregularHolidays(hours.irregularHolidays);
        setGooglePlaceId(row.google_place_id);
        setSpecialHours(false);
        setWeeklyHours(null);
        setGooglePhotoName(null);
        setCoverPath(row.restaurant_cover_path ?? null);
        setPendingCoverFile(null);
        setIsLoadingRestaurant(false);
      } catch {
        if (!cancelled) {
          setLoadError("載入餐廳失敗");
          setIsLoadingRestaurant(false);
        }
      }
    }

    void loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

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

    // Google metadata is not user-editable — always take the selected place's values.
    setGoogleRating(detail.rating);
    setGoogleRatingCount(detail.reviewCount);
    setPriceLevel(detail.priceLevel);
    setPriceMin(detail.priceMin);
    setPriceMax(detail.priceMax);
    setLatitude(detail.latitude);
    setLongitude(detail.longitude);

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

    setGooglePhotoName(detail.photo);
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
    if (isSubmitting || isLoadingRestaurant) {
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
      const businessHours = {
        periods: periods.map(({ open, close }) => ({ open, close })),
        closedDays,
        openAllYear,
        irregularHolidays,
      };

      if (isEdit && restaurantId) {
        const input: UpdateRestaurantInput = {
          name: name.trim(),
          category: categoryLabel.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          website: website.trim() || null,
          note: notes.trim() || null,
          googlePlaceId: googlePlaceId?.trim() || null,
          businessHours,
        };

        await updateRestaurant(restaurantId, input);
        showToast("success", "餐廳已更新！");

        await new Promise((resolve) => {
          window.setTimeout(resolve, SUCCESS_TOAST_MS);
        });

        router.push(`/restaurants/${restaurantId}`);
        return;
      }

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
        googleRating,
        googleRatingCount,
        priceLevel,
        priceMin,
        priceMax,
        latitude,
        longitude,
        businessHours,
      };

      const created = await createRestaurant(input);

      if (pendingCoverFile) {
        await uploadRestaurantCover({
          restaurantId: created.id,
          file: pendingCoverFile,
        });
        setPendingCoverFile(null);
      } else if (googlePhotoName) {
        // Persist Google preview photo into Storage + restaurant_cover_path.
        // Failure is non-fatal — the restaurant row is already created.
        try {
          const photoResponse = await fetch(
            `/api/google/places/photo?name=${encodeURIComponent(googlePhotoName)}`,
          );

          if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            await uploadRestaurantCover({
              restaurantId: created.id,
              file: blob,
            });
          }
        } catch {
          // Keep create success; cover can be uploaded later from edit.
        }
      }

      setCreatedRestaurantId(created.id);
      setWizardStep(2);
      showToast("success", "餐廳已建立！");
    } catch (error) {
      const message = resolveSaveErrorMessage(error, isEdit);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function finishWizard() {
    const id = createdRestaurantId;
    if (!id) {
      router.push("/restaurants");
      return;
    }
    router.push(`/restaurants/${id}`);
  }

  if (isEdit && loadError) {
    return (
      <div className="home-grid-bg min-h-full">
        <AddRestaurantHeader title="編輯餐廳" />
        <section className="flex flex-col items-center gap-3 px-5 pt-16 text-center">
          <p className="text-sm font-medium text-cocoa">{loadError}</p>
          <Link
            href={restaurantId ? `/restaurants/${restaurantId}` : "/restaurants"}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            返回餐廳詳情
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="home-grid-bg min-h-full">
      <AddRestaurantHeader
        title={
          isEdit
            ? "編輯餐廳"
            : wizardStep === 2
              ? "新增菜單（選填）"
              : "新增餐廳"
        }
      />
      {!isEdit ? <WizardStepProgress currentStep={wizardStep} /> : null}
      {isLoadingRestaurant ? (
        <div className="animate-pulse space-y-4 px-5 pt-4 pb-8" aria-hidden>
          <div className="h-12 w-full rounded-2xl bg-border/80" />
          <div className="h-72 w-full rounded-2xl bg-border/70" />
        </div>
      ) : !isEdit && wizardStep === 2 && createdRestaurantId ? (
        <>
          <section className="px-5 pt-3 pb-2">
            <p className="text-center text-sm leading-relaxed text-text-secondary">
              餐廳已建立。
              <br />
              現在可以新增菜單照片或匯入品項，
              <br />
              之後也可以隨時補上。
            </p>
          </section>
          <section className="px-5 pb-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
              <MenuManagerSection
                restaurantId={createdRestaurantId}
                restaurantName={name}
                onToast={showToast}
              />
              <MenuItemsImportPanel
                restaurantId={createdRestaurantId}
                onToast={showToast}
              />
            </div>
          </section>
          <WizardMenuStepFooter onComplete={finishWizard} />
        </>
      ) : (
        <>
          {!isEdit ? (
            <AddRestaurantGoogleSearch
              onSelectPlaceId={handleSelectPlaceId}
              fillNotice={fillNotice}
              detailLoading={detailLoading || isSubmitting}
            />
          ) : (
            <section className="flex justify-end px-5 pt-1 pb-3">
              <AddRestaurantBunnyHero />
            </section>
          )}
          <section className="px-5 pb-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
              <AddRestaurantFormCard
                restaurantId={restaurantId}
                coverPath={coverPath}
                onCoverPathChange={setCoverPath}
                pendingCoverFile={pendingCoverFile}
                onPendingCoverFileChange={setPendingCoverFile}
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
                onToast={showToast}
                specialHours={specialHours}
                weeklyHours={weeklyHours}
              />
              {isEdit && restaurantId ? (
                <>
                  <FormDivider />
                  <EditMenuEntrySection restaurantId={restaurantId} />
                </>
              ) : null}
              <FormDivider />
              <RestaurantNotesCard notes={notes} onNotesChange={setNotes} />
            </div>
          </section>
          <AddRestaurantFooter
            onSubmit={() => {
              void handleSubmit();
            }}
            isSubmitting={isSubmitting}
            submitLabel={isEdit ? "儲存修改" : "下一步"}
            submittingLabel={isEdit ? "儲存中..." : "建立中..."}
          />
        </>
      )}
      <input
        type="hidden"
        name="googlePlaceId"
        value={googlePlaceId ?? ""}
        readOnly
      />

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
