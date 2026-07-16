"use client";

import { Camera, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import RecordPhotoGallery from "@/components/diary-detail/RecordPhotoGallery";
import RecordPhotoLightbox from "@/components/diary-detail/RecordPhotoLightbox";
import {
  deleteRecordPhoto,
  listRecordPhotos,
  RECORD_PHOTOS_MAX,
  uploadRecordPhoto,
  type RecordPhoto,
} from "@/src/services/record-photo";

type RecordPhotoManagerSectionProps = {
  /**
   * Edit flow: upload/list/delete hit Storage + DB immediately.
   * Create flow: omit this and pass pendingFiles instead.
   */
  recordId?: string;
  /** Create-flow: files held until the record row exists. */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
  onToast?: (type: "success" | "error", message: string) => void;
};

type LoadStatus = "loading" | "ready" | "error";

function toPendingPhotos(files: File[], urls: string[]): RecordPhoto[] {
  return files.map((file, index) => ({
    id: `pending-${index}-${file.name}`,
    recordId: "",
    storagePath: "",
    photoOrder: index + 1,
    url: urls[index] ?? "",
    createdAt: "",
  }));
}

export default function RecordPhotoManagerSection({
  recordId,
  pendingFiles = [],
  onPendingFilesChange,
  onToast,
}: RecordPhotoManagerSectionProps) {
  const isCreateFlow = !recordId;
  const [photos, setPhotos] = useState<RecordPhoto[]>([]);
  const [status, setStatus] = useState<LoadStatus>(
    isCreateFlow ? "ready" : "loading",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingUrls = useMemo(
    () => pendingFiles.map((file) => URL.createObjectURL(file)),
    [pendingFiles],
  );

  useEffect(() => {
    return () => {
      for (const url of pendingUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pendingUrls]);

  const pendingPhotos = useMemo(
    () => toPendingPhotos(pendingFiles, pendingUrls),
    [pendingFiles, pendingUrls],
  );

  const displayPhotos = isCreateFlow ? pendingPhotos : photos;

  async function loadPhotos() {
    if (!recordId) {
      setStatus("ready");
      return;
    }

    try {
      const rows = await listRecordPhotos(recordId);
      setPhotos(rows);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (isCreateFlow) {
      setStatus("ready");
      return;
    }
    void loadPhotos();
  }, [recordId, isCreateFlow]);

  const isFull = displayPhotos.length >= RECORD_PHOTOS_MAX;
  const hasPhotos = displayPhotos.length > 0;

  function handlePick() {
    if (isUploading || isFull) {
      return;
    }
    setErrorMessage(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setErrorMessage(null);

    if (isCreateFlow) {
      if (pendingFiles.length >= RECORD_PHOTOS_MAX) {
        setErrorMessage("已達上限。");
        return;
      }
      onPendingFilesChange?.([...pendingFiles, file]);
      return;
    }

    if (!recordId) {
      return;
    }

    setIsUploading(true);

    try {
      await uploadRecordPhoto({ recordId, file });
      await loadPhotos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "上傳失敗，請稍後再試";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeletePhoto(index: number): Promise<number> {
    if (isCreateFlow) {
      const next = pendingFiles.filter((_, i) => i !== index);
      onPendingFilesChange?.(next);
      return next.length;
    }

    const target = photos[index];
    if (!target || !recordId) {
      return photos.length;
    }

    try {
      await deleteRecordPhoto({
        id: target.id,
        storagePath: target.storagePath,
      });
      const rows = await listRecordPhotos(recordId);
      setPhotos(rows);
      onToast?.("success", "照片已刪除。");
      return rows.length;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "刪除失敗，請稍後再試";
      onToast?.("error", message);
      return photos.length;
    }
  }

  return (
    <div className="space-y-3 px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Camera className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
          <span className="text-sm font-medium text-deep-brown">照片</span>
          <span className="text-[10px] font-medium text-text-secondary">
            （選填）
          </span>
        </div>

        {!isFull ? (
          <button
            type="button"
            onClick={handlePick}
            disabled={isUploading}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-caramel px-3 py-1.5 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {isUploading ? "上傳中…" : "新增照片"}
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {status === "loading" ? (
        <div className="flex gap-3 overflow-hidden pb-1" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] w-28 shrink-0 animate-pulse rounded-xl bg-border/70"
            />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-rice-white px-4 py-8 text-center shadow-soft">
          <p className="text-sm text-cocoa">載入照片失敗</p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              void loadPhotos();
            }}
            className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
          >
            重新整理
          </button>
        </div>
      ) : hasPhotos ? (
        <RecordPhotoGallery
          photos={displayPhotos}
          onSelect={setLightboxIndex}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-10 text-center shadow-soft">
          <p className="text-2xl" aria-hidden>
            📷
          </p>
          <p className="text-sm text-cocoa/70">尚未新增照片</p>
          <button
            type="button"
            onClick={handlePick}
            disabled={isUploading}
            className="inline-flex items-center gap-1 rounded-full bg-caramel px-4 py-2 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {isUploading ? "上傳中…" : "新增照片"}
          </button>
        </div>
      )}

      {errorMessage ? (
        <p className="text-center text-xs text-red-500">{errorMessage}</p>
      ) : null}

      {isFull ? (
        <p className="text-center text-xs text-cocoa/60">已達上限。</p>
      ) : null}

      {lightboxIndex !== null ? (
        <RecordPhotoLightbox
          photos={displayPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDelete={handleDeletePhoto}
        />
      ) : null}
    </div>
  );
}
