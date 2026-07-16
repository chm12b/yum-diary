"use client";

import { useEffect, useState } from "react";

import MenuGallery from "@/components/restaurants/detail/MenuGallery";
import MenuLightbox from "@/components/restaurants/detail/MenuLightbox";
import SectionHeading from "@/components/restaurants/detail/SectionHeading";
import { homeAssets } from "@/src/lib/home-assets";
import { listMenuPhotos, type MenuPhoto } from "@/src/services/menu-photo";

type MenuSectionProps = {
  restaurantId: string;
  restaurantName: string;
};

type LoadStatus = "loading" | "ready" | "error";

export default function MenuSection({
  restaurantId,
  restaurantName,
}: MenuSectionProps) {
  const [photos, setPhotos] = useState<MenuPhoto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const hasPhotos = photos.length > 0;

  return (
    <section className="px-5 pt-5">
      <SectionHeading
        iconSrc={homeAssets.storeMenu}
        title={hasPhotos ? "菜單（點擊可放大）" : "菜單"}
        iconSize={50}
        className="-mt-[10px] -mb-[2px] flex items-center gap-2"
      />

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
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-10 text-center shadow-soft">
          <p className="text-sm text-cocoa/70">📋 尚未新增菜單</p>
        </div>
      )}

      {lightboxIndex !== null ? (
        <MenuLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          restaurantName={restaurantName}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  );
}
