"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ArchivedRestaurantCard, {
  type ArchivedRestaurantCardData,
} from "@/components/settings/ArchivedRestaurantCard";
import UnarchiveRestaurantDialog from "@/components/settings/UnarchiveRestaurantDialog";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { resolveRestaurantCoverUrl } from "@/src/lib/restaurants/cover-url";
import {
  listArchivedRestaurants,
  unarchiveRestaurant,
  type RestaurantRecord,
} from "@/src/services/restaurant";

type LoadStatus = "loading" | "ready" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const TOAST_MS = 1800;

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

function toCardData(row: RestaurantRecord): ArchivedRestaurantCardData | null {
  if (!row.archived_at) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    imageUrl: resolveRestaurantCoverUrl(
      row.restaurant_cover_path,
      row.updated_at,
    ),
    archivedAt: row.archived_at,
  };
}

export default function ArchivedRestaurantsPage() {
  const router = useRouter();
  const { revision, currentGroupId, loading: groupLoading } =
    useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [restaurants, setRestaurants] = useState<ArchivedRestaurantCardData[]>(
    [],
  );
  const [restoreTarget, setRestoreTarget] =
    useState<ArchivedRestaurantCardData | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (groupLoading) {
      return;
    }

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        if (!cancelled) {
          setStatus("loading");
        }

        if (!currentGroupId) {
          if (!cancelled) {
            setRestaurants([]);
            setStatus("ready");
          }
          return;
        }

        try {
          const rows = await listArchivedRestaurants();
          if (cancelled) {
            return;
          }

          setRestaurants(
            rows
              .map(toCardData)
              .filter((item): item is ArchivedRestaurantCardData => item != null),
          );
          setStatus("ready");
        } catch {
          if (!cancelled) {
            setRestaurants([]);
            setStatus("error");
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [revision, currentGroupId, groupLoading]);

  async function handleConfirmRestore() {
    if (!restoreTarget || restoring) {
      return;
    }

    const target = restoreTarget;
    setRestoring(true);
    try {
      await unarchiveRestaurant(target.id);
      setRestaurants((current) =>
        current.filter((restaurant) => restaurant.id !== target.id),
      );
      setRestoreTarget(null);
      showToast("success", `↩️ 已恢復「${target.name}」`);
    } catch {
      showToast("error", "恢復失敗，請稍後再試。");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="home-grid-bg min-h-full pb-8">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/settings"
          aria-label="返回設定"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          📦 已封存餐廳
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-2 pb-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          查看與管理已封存的餐廳。
        </p>
      </section>

      <section className="px-5 pb-8">
        {status === "loading" || groupLoading ? (
          <div className="flex animate-pulse flex-col gap-4" aria-hidden>
            <div className="h-[148px] w-full rounded-[1.25rem] bg-border/80" />
            <div className="h-[148px] w-full rounded-[1.25rem] bg-border/70" />
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-cocoa">載入失敗</p>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {status === "ready" && restaurants.length === 0 ? (
          <section className="flex flex-col items-center gap-3 px-5 pt-[50px] pb-2 text-center">
            <span className="text-4xl leading-none" aria-hidden>
              🐰
            </span>
            <h3 className="font-display text-base font-bold text-deep-brown">
              目前沒有已封存餐廳。
            </h3>
          </section>
        ) : null}

        {status === "ready" && restaurants.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {restaurants.map((restaurant) => (
              <li key={restaurant.id}>
                <ArchivedRestaurantCard
                  restaurant={restaurant}
                  onOpen={() => {
                    router.push(`/restaurants/${restaurant.id}`);
                  }}
                  onRestore={() => {
                    setRestoreTarget(restaurant);
                  }}
                  restoreDisabled={restoring}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <UnarchiveRestaurantDialog
        open={restoreTarget != null}
        restaurantName={restoreTarget?.name}
        submitting={restoring}
        onClose={() => {
          if (!restoring) {
            setRestoreTarget(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmRestore();
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
