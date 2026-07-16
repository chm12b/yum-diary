"use client";

import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { RecordPhoto } from "@/src/services/record-photo";

type RecordPhotoLightboxProps = {
  photos: RecordPhoto[];
  initialIndex: number;
  onClose: () => void;
  /**
   * Optional delete handler (edit context only). Deletes the photo at the
   * given index and returns the remaining photo count so the lightbox can move
   * to the neighbouring photo or close when the album becomes empty.
   */
  onDelete?: (index: number) => Promise<number>;
};

export default function RecordPhotoLightbox({
  photos,
  initialIndex,
  onClose,
  onDelete,
}: RecordPhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const total = photos.length;
  const clamped = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
  const active = photos[clamped];

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (confirmOpen) {
          if (!isDeleting) {
            setConfirmOpen(false);
          }
        } else {
          onClose();
        }
        return;
      }

      if (confirmOpen) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setIndex((current) => (current > 0 ? current - 1 : current));
      } else if (event.key === "ArrowRight") {
        setIndex((current) => (current < total - 1 ? current + 1 : current));
      }
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, total, confirmOpen, isDeleting]);

  async function handleConfirmDelete() {
    if (!onDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const remaining = await onDelete(clamped);
      setConfirmOpen(false);
      if (remaining <= 0) {
        onClose();
      } else {
        setIndex(Math.min(clamped, remaining - 1));
      }
    } finally {
      setIsDeleting(false);
    }
  }

  if (!active) {
    return null;
  }

  const canPrev = clamped > 0;
  const canNext = clamped < total - 1;
  const showToolbar = Boolean(onDelete) || total > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="照片預覽"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" strokeWidth={2} />
      </button>

      <div
        className="relative flex h-full w-full items-center justify-center p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          key={active.id}
          src={active.url}
          alt={`照片 ${clamped + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          unoptimized
        />
      </div>

      {canPrev ? (
        <button
          type="button"
          aria-label="上一張"
          onClick={(event) => {
            event.stopPropagation();
            setIndex((current) => current - 1);
          }}
          className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          aria-label="下一張"
          onClick={(event) => {
            event.stopPropagation();
            setIndex((current) => current + 1);
          }}
          className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        </button>
      ) : null}

      {showToolbar ? (
        <div className="absolute inset-x-0 bottom-6 flex items-center px-6">
          <div className="flex flex-1 justify-start">
            {onDelete ? (
              <button
                type="button"
                aria-label="刪除這張照片"
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirmOpen(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Trash2 className="h-5 w-5" strokeWidth={2} />
              </button>
            ) : null}
          </div>

          <p className="flex-none text-sm font-medium text-white/90">
            {clamped + 1} / {total}
          </p>

          <div className="flex flex-1 justify-end" aria-hidden />
        </div>
      ) : null}

      {confirmOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 px-8"
          onClick={(event) => {
            event.stopPropagation();
            if (!isDeleting) {
              setConfirmOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-label="刪除照片確認"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-rice-white p-5 text-center shadow-card"
          >
            <p className="text-sm font-medium text-deep-brown">
              確定要刪除這張照片嗎？
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
                onClick={() => void handleConfirmDelete()}
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
