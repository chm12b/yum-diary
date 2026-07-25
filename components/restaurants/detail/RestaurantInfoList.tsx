"use client";

import {
  CalendarOff,
  Clock,
  Globe,
  MapPin,
  NotebookPen,
  Phone,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

import RestaurantInfoItem from "@/components/restaurants/detail/RestaurantInfoItem";
import { formatGoogleSyncAt } from "@/src/lib/format-google-sync-at";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type RestaurantInfoListProps = {
  restaurant: RestaurantDetail;
};

function formatHourSlots(slots: string[]): string {
  return slots
    .map((slot) => slot.replace(/\s*-\s*/g, "–"))
    .join("\n");
}

function hasFiniteCoord(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function openNavigation(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}) {
  if (hasFiniteCoord(input.latitude) && hasFiniteCoord(input.longitude)) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${input.latitude},${input.longitude}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  const trimmedAddress = input.address?.trim();
  if (trimmedAddress) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAddress)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
}

export default function RestaurantInfoList({
  restaurant,
}: RestaurantInfoListProps) {
  const {
    openingHours,
    phoneNumber,
    address,
    latitude,
    longitude,
    websiteUrl,
    notes,
    googlePlaceId,
    lastGoogleSyncAt,
  } = restaurant;

  const closedDaysLabel =
    openingHours.closedDays.length > 0
      ? openingHours.closedDays.join("、")
      : "無固定公休";

  const hoursLabel = formatHourSlots(openingHours.slots);
  const phone = phoneNumber?.trim() ?? "";
  const hasPhone = Boolean(phone);
  const hasWebsite = Boolean(websiteUrl?.trim());
  const hasAddress = Boolean(address?.trim());
  const hasNotes = Boolean(notes?.trim());
  const canShowGoogleSync = Boolean(googlePlaceId?.trim());
  const hasSynced =
    typeof lastGoogleSyncAt === "string" && lastGoogleSyncAt.trim().length > 0;

  return (
    <section className="relative px-5 pt-4">
      <div className="relative mb-3">
        <div className="-mb-[3px] flex items-center gap-2">
          <Image
            src={homeAssets.storeInfo}
            alt=""
            width={40}
            height={30}
            aria-hidden
            className="object-contain"
            style={{ width: 40, height: 30 }}
          />
          <h2 className="text-base font-bold text-deep-brown">店家資訊</h2>
        </div>
        <Image
          src={homeAssets.detailBunny}
          alt=""
          width={160}
          height={160}
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 z-10 h-40 w-40 object-contain"
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-rice-white px-4 py-4 pb-6 shadow-soft">
        <div className="flex flex-col gap-5">
          {/* Row 1: Hours | Closed days */}
          <div className="grid grid-cols-2 items-start gap-x-4">
            <RestaurantInfoItem icon={Clock} title="營業時間">
              <p className="whitespace-pre-line">{hoursLabel}</p>
            </RestaurantInfoItem>
            <RestaurantInfoItem icon={CalendarOff} title="公休日">
              <p className="whitespace-pre-line">{closedDaysLabel}</p>
            </RestaurantInfoItem>
          </div>

          {/* Row 2: Phone | Website */}
          {hasPhone || hasWebsite ? (
            <div className="grid grid-cols-2 items-start gap-x-4">
              {hasPhone ? (
                <RestaurantInfoItem icon={Phone} title="電話">
                  <a
                    href={`tel:${phone.replace(/[\s()-]/g, "")}`}
                    className="font-medium text-caramel transition-colors hover:underline"
                  >
                    {phone}
                  </a>
                </RestaurantInfoItem>
              ) : (
                <div />
              )}
              {hasWebsite ? (
                <RestaurantInfoItem icon={Globe} title="官方網站">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-caramel transition-colors hover:underline"
                  >
                    前往 →
                  </a>
                </RestaurantInfoItem>
              ) : null}
            </div>
          ) : null}

          {/* Row 3: Address */}
          {hasAddress ? (
            <RestaurantInfoItem
              icon={MapPin}
              title="地址"
              titleAction={
                <button
                  type="button"
                  onClick={() => {
                    openNavigation({ latitude, longitude, address });
                  }}
                  className="text-xs font-medium text-caramel transition-colors hover:underline"
                >
                  🧭 導航
                </button>
              }
            >
              <p className="whitespace-pre-line">{address}</p>
            </RestaurantInfoItem>
          ) : null}

          {/* Row 4: Notes */}
          {hasNotes ? (
            <RestaurantInfoItem icon={NotebookPen} title="備註">
              <p className="whitespace-pre-line">{notes}</p>
            </RestaurantInfoItem>
          ) : null}

          {/* Row 5: Google Sync */}
          {canShowGoogleSync ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <RefreshCw
                  className="h-4 w-4 shrink-0 text-caramel"
                  strokeWidth={2}
                />
                <p className="text-xs font-medium text-deep-brown">
                  Google Sync
                </p>
              </div>
              <p className="shrink-0 text-xs text-cocoa">
                {hasSynced
                  ? formatGoogleSyncAt(lastGoogleSyncAt)
                  : "Not synced"}
              </p>
            </div>
          ) : null}
        </div>

        <Image
          src={homeAssets.stickerFlowerPink}
          alt=""
          width={24}
          height={24}
          aria-hidden
          className="pointer-events-none absolute right-[3px] bottom-[1.5px] h-6 w-6 object-contain opacity-80"
        />
      </div>
    </section>
  );
}
