"use client";

import { MapPin, Pencil, Share } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  buildRestaurantShareMessage,
  buildRestaurantShareUrl,
} from "@/src/lib/app-url";
import { homeAssets } from "@/src/lib/home-assets";

type DetailActionBarProps = {
  restaurantId: string;
  restaurantName: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  onToast: (type: "success" | "error", message: string) => void;
};

const outlineButtonClass =
  "flex shrink-0 items-center justify-center gap-1 rounded-xl border border-border bg-rice-white px-3 py-2.5 text-xs font-medium text-deep-brown shadow-soft";

function hasFiniteCoord(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

async function copyShareText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

export default function DetailActionBar({
  restaurantId,
  restaurantName,
  latitude,
  longitude,
  address,
  onToast,
}: DetailActionBarProps) {
  async function handleShare() {
    const url = buildRestaurantShareUrl(restaurantId);
    const text = buildRestaurantShareMessage(restaurantName, url);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await copyShareText(text);
      onToast("success", "已複製分享連結。");
    } catch {
      onToast("error", "分享失敗，請稍後再試。");
    }
  }

  function handleNavigate() {
    if (hasFiniteCoord(latitude) && hasFiniteCoord(longitude)) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    const trimmedAddress = address?.trim();
    if (trimmedAddress) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAddress)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    onToast("error", "目前沒有可導航的位置資訊。");
  }

  return (
    <section className="-mt-[10px] px-5 pt-4 pb-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void handleShare();
          }}
          className={`${outlineButtonClass} w-[4.5rem]`}
        >
          <Share className="h-4 w-4 text-cocoa" strokeWidth={2} />
          分享
        </button>
        <button
          type="button"
          onClick={handleNavigate}
          className={`${outlineButtonClass} w-[4.5rem]`}
        >
          <MapPin className="h-4 w-4 text-cocoa" strokeWidth={2} />
          導航
        </button>
        <div className="relative min-w-0 flex-1">
          <Link
            href={`/restaurants/${restaurantId}/records/new`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sakura-pink pr-8 text-[15px] font-bold tracking-[1px] text-deep-brown shadow-pink-button"
          >
            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            新增美食日記
          </Link>
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={35}
            height={60}
            aria-hidden
            className="pointer-events-none absolute -right-1 top-1/2 mt-[-1px] mr-[5px] h-[60px] w-[35px] -translate-y-1/2 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
