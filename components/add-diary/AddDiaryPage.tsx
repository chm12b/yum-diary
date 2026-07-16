"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AddDiaryBunnyHero from "@/components/add-diary/AddDiaryBunnyHero";
import AddDiaryFooter from "@/components/add-diary/AddDiaryFooter";
import AddDiaryFormCard from "@/components/add-diary/AddDiaryFormCard";
import AddDiaryHeader from "@/components/add-diary/AddDiaryHeader";
import RecordPhotoManagerSection from "@/components/add-diary/RecordPhotoManagerSection";
import {
  createRecord,
  getRecord,
  updateRecord,
} from "@/src/services/record";
import { uploadRecordPhoto } from "@/src/services/record-photo";
import {
  listRecordFoods,
  replaceRecordFoods,
} from "@/src/services/record-food";

type AddDiaryPageProps =
  | { mode?: "create"; restaurantId: string; recordId?: never }
  | { mode: "edit"; recordId: string; restaurantId?: never };

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type LoadStatus = "ready" | "loading" | "not-found" | "error";

const TOAST_MS = 1800;
const SUCCESS_NAVIGATE_MS = 900;

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddDiaryPage(props: AddDiaryPageProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const recordId = isEdit ? props.recordId : null;
  const restaurantId = !isEdit ? props.restaurantId : null;

  const [visitDate, setVisitDate] = useState(todayIsoDate);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState("");
  const [foodRows, setFoodRows] = useState<string[]>([""]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    isEdit ? "loading" : "ready",
  );
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !recordId) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoadStatus("loading");

      try {
        const [row, foods] = await Promise.all([
          getRecord(recordId!),
          listRecordFoods(recordId!),
        ]);

        if (cancelled) {
          return;
        }

        if (!row) {
          setLoadStatus("not-found");
          return;
        }

        setVisitDate(row.visit_date);
        setRating(row.rating);
        setNotes(row.notes);
        setFoodRows(
          foods.length > 0 ? foods.map((food) => food.name) : [""],
        );
        setLoadStatus("ready");
      } catch {
        if (!cancelled) {
          setLoadStatus("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isEdit, recordId, loadAttempt]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  async function handleSave() {
    if (isSubmitting) {
      return;
    }

    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      showToast("error", "請填寫心得");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && recordId) {
        await updateRecord(recordId, {
          visitDate,
          rating,
          notes: trimmedNotes,
        });
        await replaceRecordFoods(recordId, foodRows);

        showToast("success", "已更新用餐紀錄。");

        if (navigateTimerRef.current != null) {
          window.clearTimeout(navigateTimerRef.current);
        }
        navigateTimerRef.current = window.setTimeout(() => {
          router.push(`/records/${recordId}`);
          navigateTimerRef.current = null;
        }, SUCCESS_NAVIGATE_MS);
        return;
      }

      if (!restaurantId) {
        throw new Error("Missing restaurantId");
      }

      const created = await createRecord({
        restaurantId,
        visitDate,
        rating,
        notes: trimmedNotes,
      });

      for (const file of pendingPhotos) {
        await uploadRecordPhoto({ recordId: created.id, file });
      }
      await replaceRecordFoods(created.id, foodRows);
      setPendingPhotos([]);

      showToast("success", "已新增用餐紀錄。");

      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
      navigateTimerRef.current = window.setTimeout(() => {
        router.push(`/records/${created.id}`);
        navigateTimerRef.current = null;
      }, SUCCESS_NAVIGATE_MS);
    } catch {
      showToast("error", "儲存失敗，請稍後再試");
      setIsSubmitting(false);
    }
  }

  if (isEdit && loadStatus === "loading") {
    return (
      <div className="home-grid-bg min-h-full">
        <div className="animate-pulse px-5 pt-4" aria-hidden>
          <div className="mx-auto h-9 w-40 rounded-full bg-border" />
          <div className="mt-8 h-56 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );
  }

  if (isEdit && loadStatus === "error") {
    return (
      <div className="home-grid-bg flex min-h-full flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="text-sm font-medium text-cocoa">載入紀錄失敗</p>
        <button
          type="button"
          onClick={() => setLoadAttempt((n) => n + 1)}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
        >
          重新整理
        </button>
      </div>
    );
  }

  if (isEdit && (loadStatus === "not-found" || !recordId)) {
    return (
      <div className="home-grid-bg flex min-h-full flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="text-sm font-medium text-cocoa">找不到這筆用餐紀錄</p>
        <Link
          href="/restaurants"
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button"
        >
          返回餐廳列表
        </Link>
      </div>
    );
  }

  const backHref = isEdit
    ? `/records/${recordId}`
    : `/restaurants/${restaurantId}`;
  const title = isEdit ? "編輯用餐紀錄" : "新增用餐紀錄";

  return (
    <div className="home-grid-bg min-h-full">
      <AddDiaryHeader backHref={backHref} title={title} />
      <AddDiaryBunnyHero />
      <AddDiaryFormCard
        visitDate={visitDate}
        rating={rating}
        notes={notes}
        foodRows={foodRows}
        onVisitDateChange={setVisitDate}
        onRatingChange={setRating}
        onNotesChange={setNotes}
        onFoodRowsChange={setFoodRows}
      />
      <section className="px-5 pb-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          {isEdit && recordId ? (
            <RecordPhotoManagerSection
              recordId={recordId}
              onToast={showToast}
            />
          ) : (
            <RecordPhotoManagerSection
              pendingFiles={pendingPhotos}
              onPendingFilesChange={setPendingPhotos}
              onToast={showToast}
            />
          )}
        </div>
      </section>
      <AddDiaryFooter
        disabled={!notes.trim()}
        isSubmitting={isSubmitting}
        onSave={() => {
          void handleSave();
        }}
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
