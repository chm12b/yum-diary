"use client";

import { Camera, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  deleteRestaurantCover,
  uploadRestaurantCover,
} from "@/src/services/restaurant-cover";
import { resolveRestaurantCoverUrl } from "@/src/lib/restaurants/cover-url";

type CoverPhotoFieldProps = {
  /** When set, upload/delete hit Storage + DB immediately. */
  restaurantId?: string;
  coverPath: string | null;
  onCoverPathChange: (path: string | null) => void;
  /** Create-flow: file held until the restaurant row exists. */
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  /** Create-flow Google preview only (no Storage). */
  googlePhotoName: string | null;
  onClearGooglePhoto: () => void;
  onToast?: (type: "success" | "error", message: string) => void;
};

function FieldLabel() {
  return (
    <div className="flex items-center gap-2">
      <Camera className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
      <span className="text-sm font-medium text-deep-brown">店家照片</span>
      <span className="text-[10px] font-medium text-text-secondary">（選填）</span>
    </div>
  );
}

export default function CoverPhotoField({
  restaurantId,
  coverPath,
  onCoverPathChange,
  pendingFile,
  onPendingFileChange,
  googlePhotoName,
  onClearGooglePhoto,
  onToast,
}: CoverPhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cacheKey, setCacheKey] = useState(() => String(Date.now()));

  const pendingPreviewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  );

  useEffect(() => {
    if (!pendingPreviewUrl) {
      return;
    }
    return () => {
      URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const coverUrl = coverPath
    ? resolveRestaurantCoverUrl(coverPath, cacheKey)
    : null;
  const googlePreviewUrl = googlePhotoName
    ? `/api/google/places/photo?name=${encodeURIComponent(googlePhotoName)}`
    : null;

  const displayUrl = coverUrl ?? pendingPreviewUrl ?? googlePreviewUrl;
  const canDeleteCover = Boolean(restaurantId && coverPath);
  const busy = isUploading || isDeleting;

  function handlePick() {
    if (busy) {
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || busy) {
      return;
    }

    if (!restaurantId) {
      onClearGooglePhoto();
      onPendingFileChange(file);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadRestaurantCover({ restaurantId, file });
      setCacheKey(String(Date.now()));
      onCoverPathChange(result.path);
      onPendingFileChange(null);
      onToast?.("success", "店家照片已更新。");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "上傳失敗，請稍後再試";
      onToast?.("error", message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!restaurantId || !coverPath || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRestaurantCover({ restaurantId, storagePath: coverPath });
      onCoverPathChange(null);
      setConfirmOpen(false);
      onToast?.("success", "店家照片已刪除。");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "刪除失敗，請稍後再試";
      onToast?.("error", message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3 px-4 py-3.5">
      <FieldLabel />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-cream-bg/40">
          {coverUrl || pendingPreviewUrl ? (
            <button
              type="button"
              onClick={handlePick}
              disabled={busy}
              aria-label="更換店家照片"
              className="relative block aspect-[16/10] w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Image
                src={displayUrl}
                alt="店家照片"
                fill
                unoptimized
                className="object-cover"
              />
              {isUploading ? (
                <span className="absolute inset-0 flex items-center justify-center bg-deep-brown/40 text-sm font-medium text-rice-white">
                  上傳中…
                </span>
              ) : null}
            </button>
          ) : (
            <div className="relative aspect-[16/10] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- Google preview proxy URL */}
              <img
                src={displayUrl}
                alt="Google 店家照片預覽"
                loading="lazy"
                decoding="async"
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
          )}

          {canDeleteCover ? (
            <button
              type="button"
              aria-label="刪除店家照片"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
              className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-deep-brown/70 text-white shadow-soft transition-colors hover:bg-deep-brown disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}

          {pendingPreviewUrl && !restaurantId ? (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-deep-brown/55 px-3 py-2">
              <button
                type="button"
                onClick={handlePick}
                className="text-[11px] font-medium text-rice-white"
              >
                更換
              </button>
              <button
                type="button"
                onClick={() => onPendingFileChange(null)}
                className="text-[11px] font-medium text-sakura-pink"
              >
                移除
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          aria-label="上傳店家照片"
          onClick={handlePick}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-caramel/50 bg-cream-bg/40 px-4 py-10 text-cocoa transition-colors hover:bg-cream-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-7 w-7" strokeWidth={2} />
          <span className="text-sm font-medium text-deep-brown">
            {isUploading ? "上傳中…" : "上傳店家照片"}
          </span>
          <span className="text-[11px] text-text-secondary">
            建議使用店面或招牌照片
          </span>
        </button>
      )}

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8"
          onClick={() => {
            if (!isDeleting) {
              setConfirmOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-label="刪除店家照片確認"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-rice-white p-5 text-center shadow-card"
          >
            <p className="text-sm font-medium text-deep-brown">
              確定要刪除店家照片嗎？
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-border bg-cream-bg/60 px-4 py-2 text-sm font-bold text-cocoa transition-colors hover:bg-cream-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleConfirmDelete();
                }}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "刪除中…" : "刪除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
