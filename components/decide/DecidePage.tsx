"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import DecideHeader from "@/components/decide/DecideHeader";
import StarRating from "@/components/restaurants/StarRating";
import StatusBadge from "@/components/shared/StatusBadge";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { formatDistance } from "@/src/lib/restaurants/distance";
import { resolvePriceLabel } from "@/src/lib/restaurants/price-level";
import {
  getDecideCandidates,
  loadDecidePreferences,
  type DecideCandidate,
  type DecideFilters,
} from "@/src/services/decide";
import { getReferenceLocation } from "@/src/services/groups/group.service";

type PageStage = "deciding" | "result" | "empty" | "error";

const DECIDE_DELAY_MS = 1500;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function resolveFilters(): Promise<DecideFilters> {
  const prefs = loadDecidePreferences();

  try {
    const { data, error } = await getReferenceLocation();
    const hasReferenceLocation =
      !error &&
      data?.lat != null &&
      data.lng != null &&
      Number.isFinite(data.lat) &&
      Number.isFinite(data.lng);

    return {
      ...prefs,
      maxDistanceKm: hasReferenceLocation ? prefs.maxDistanceKm : null,
    };
  } catch {
    return {
      ...prefs,
      maxDistanceKm: null,
    };
  }
}

export default function DecidePage() {
  const { revision } = useCurrentGroup();
  const [stage, setStage] = useState<PageStage>("deciding");
  const [candidate, setCandidate] = useState<DecideCandidate | null>(null);
  const [drawToken, setDrawToken] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setCandidate(null);
    setStage("deciding");

    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const filters = await resolveFilters();
          const [result] = await Promise.all([
            getDecideCandidates(filters),
            delay(DECIDE_DELAY_MS),
          ]);

          if (requestIdRef.current !== requestId) {
            return;
          }

          setCandidate(result);
          setStage(result ? "result" : "empty");
        } catch {
          if (requestIdRef.current !== requestId) {
            return;
          }

          setCandidate(null);
          setStage("error");
        }
      })();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      requestIdRef.current += 1;
    };
  }, [revision, drawToken]);

  const restaurant = candidate?.restaurant ?? null;
  const priceLabel = restaurant ? resolvePriceLabel(restaurant) : null;

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <DecideHeader />

      {stage === "deciding" ? (
        <section
          className="mx-5 mt-8 rounded-3xl border border-border bg-rice-white px-5 py-12 text-center shadow-card"
          aria-live="polite"
        >
          <div className="animate-pulse text-6xl" aria-hidden>
            🐰
          </div>
          <p className="mt-5 font-display text-lg font-bold text-deep-brown">
            讓我想想今天吃什麼...
          </p>
        </section>
      ) : null}

      {stage === "result" && candidate && restaurant ? (
        <section className="mx-5 mt-6 overflow-hidden rounded-3xl border border-border bg-rice-white shadow-card">
          <div className="px-5 pt-6 text-center">
            <p className="text-4xl" aria-hidden>
              🎉
            </p>
            <p className="mt-2 text-sm text-text-secondary">今天就吃：</p>
          </div>

          <div className="mx-5 mt-4 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-soft">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={restaurant.imageUrl}
                alt={restaurant.name}
                fill
                priority
                sizes="(max-width: 28rem) calc(100vw - 5rem), 23rem"
                className="object-cover"
              />
            </div>
          </div>

          <div className="px-5 py-5">
            <h2 className="text-center font-display text-2xl font-bold text-deep-brown">
              {restaurant.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {restaurant.rating > 0 ? (
                <StarRating
                  rating={restaurant.rating}
                  reviewCount={restaurant.reviewCount}
                />
              ) : null}
              {priceLabel ? (
                <span className="text-sm font-medium text-cocoa">
                  {priceLabel}
                </span>
              ) : null}
              {restaurant.distanceMeters > 0 ? (
                <span className="text-sm text-cocoa">
                  📍 {formatDistance(restaurant.distanceMeters)}
                </span>
              ) : null}
              <StatusBadge status={restaurant.openStatus ?? "unknown"} />
            </div>

            <p className="mt-5 rounded-2xl bg-sakura-pink/30 px-4 py-3 text-center text-sm leading-relaxed text-deep-brown">
              {candidate.message}
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={`/restaurants/${restaurant.id}`}
                className="flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-transform active:scale-[0.98]"
              >
                查看餐廳
              </Link>
              <button
                type="button"
                onClick={() => setDrawToken((token) => token + 1)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-rice-white text-sm font-bold text-deep-brown shadow-soft transition-transform active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 text-cocoa" strokeWidth={2} />
                再抽一次
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {stage === "empty" ? (
        <section className="mx-5 mt-8 rounded-3xl border border-border bg-rice-white px-5 py-9 text-center shadow-card">
          <p className="text-4xl" aria-hidden>
            🐰
          </p>
          <h2 className="mt-4 font-display text-lg font-bold text-deep-brown">
            目前沒有符合條件的餐廳。
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            試試放寬距離、
            <br />
            取消收藏限制，
            <br />
            或選擇其他分類。
          </p>
          <Link
            href="/settings/decide"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-caramel px-8 text-sm font-bold text-rice-white shadow-button"
          >
            重新設定
          </Link>
        </section>
      ) : null}

      {stage === "error" ? (
        <section className="mx-5 mt-8 rounded-3xl border border-border bg-rice-white px-5 py-9 text-center shadow-card">
          <p className="text-sm font-medium text-cocoa">
            載入餐廳失敗，請稍後再試。
          </p>
          <button
            type="button"
            onClick={() => setDrawToken((token) => token + 1)}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-caramel px-7 text-sm font-bold text-rice-white shadow-button"
          >
            再試一次
          </button>
        </section>
      ) : null}
    </div>
  );
}
