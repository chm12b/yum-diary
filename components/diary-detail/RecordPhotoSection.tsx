"use client";

import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

import RecordPhotoGallery from "@/components/diary-detail/RecordPhotoGallery";
import RecordPhotoLightbox from "@/components/diary-detail/RecordPhotoLightbox";
import {
  listRecordPhotos,
  type RecordPhoto,
} from "@/src/services/record-photo";

type RecordPhotoSectionProps = {
  recordId: string;
};

type LoadStatus = "loading" | "ready" | "error";

export default function RecordPhotoSection({
  recordId,
}: RecordPhotoSectionProps) {
  const [photos, setPhotos] = useState<RecordPhoto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  async function loadPhotos() {
    try {
      const rows = await listRecordPhotos(recordId);
      setPhotos(rows);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadPhotos();
  }, [recordId]);

  const hasPhotos = photos.length > 0;

  return (
    <section className="px-5 pt-2 pb-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="space-y-3 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Camera className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
              <span className="text-sm font-medium text-deep-brown">
                {hasPhotos ? "照片（點擊可放大）" : "照片"}
              </span>
            </div>
          </div>

          {status === "loading" ? (
            <div className="flex gap-3 overflow-hidden pb-1" aria-hidden>
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] w-28 shrink-0 animate-pulse rounded-xl bg-border/70"
                />
              ))}
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cream-bg/60 px-4 py-8 text-center">
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
              photos={photos}
              onSelect={setLightboxIndex}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-cream-bg/60 px-4 py-10 text-center">
              <p className="text-2xl" aria-hidden>
                📷
              </p>
              <p className="text-sm text-cocoa/70">尚未新增照片</p>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null ? (
        <RecordPhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  );
}
