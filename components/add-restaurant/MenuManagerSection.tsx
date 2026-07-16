"use client";

import { BookOpen, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import MenuGallery from "@/components/restaurants/detail/MenuGallery";
import MenuLightbox from "@/components/restaurants/detail/MenuLightbox";
import {
  deleteMenuPhoto,
  listMenuPhotos,
  MENU_PHOTOS_MAX,
  uploadMenuPhoto,
  type MenuPhoto,
} from "@/src/services/menu-photo";

type MenuManagerSectionProps = {
  restaurantId: string;
  restaurantName: string;
  onToast?: (type: "success" | "error", message: string) => void;
};

type LoadStatus = "loading" | "ready" | "error";

export default function MenuManagerSection({
  restaurantId,
  restaurantName,
  onToast,
}: MenuManagerSectionProps) {
  const [photos, setPhotos] = useState<MenuPhoto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadPhotos() {
    try {
      const rows = await listMenuPhotos(restaurantId);
      setPhotos(rows);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadPhotos();
  }, [restaurantId]);

  const isFull = photos.length >= MENU_PHOTOS_MAX;
  const hasPhotos = photos.length > 0;

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

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await uploadMenuPhoto({ restaurantId, file });
      await loadPhotos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "上傳失敗，請稍後再試";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  }

  // Deletes the photo at `index` and returns the remaining count so the
  // lightbox can navigate to the next photo or close when the album empties.
  async function handleDeletePhoto(index: number): Promise<number> {
    const target = photos[index];
    if (!target) {
      return photos.length;
    }

    try {
      await deleteMenuPhoto({
        id: target.id,
        storagePath: target.storagePath,
      });
      const rows = await listMenuPhotos(restaurantId);
      setPhotos(rows);
      onToast?.("success", "菜單已刪除。");
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
      {/* Title row — add button stays here so it is always reachable */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
          <span className="text-sm font-medium text-deep-brown">菜單</span>
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
            {isUploading ? "上傳中…" : "新增菜單"}
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
          <p className="text-sm text-cocoa">載入菜單失敗</p>
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
        <MenuGallery
          photos={photos}
          restaurantName={restaurantName}
          onSelect={setLightboxIndex}
        />
      ) : (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-10 text-center shadow-soft">
          <p className="text-sm text-cocoa/70">📖 尚未新增菜單</p>
          <p className="text-xs text-cocoa/50">
            點右上角「新增菜單」開始建立
          </p>
        </div>
      )}

      {errorMessage ? (
        <p className="text-center text-xs text-red-500">{errorMessage}</p>
      ) : null}

      {isFull ? (
        <p className="text-center text-xs text-cocoa/60">
          已達上限（{MENU_PHOTOS_MAX} 張）
        </p>
      ) : null}

      {lightboxIndex !== null ? (
        <MenuLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          restaurantName={restaurantName}
          onClose={() => setLightboxIndex(null)}
          onDelete={handleDeletePhoto}
        />
      ) : null}
    </div>
  );
}
