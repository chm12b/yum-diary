"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import SearchBar from "@/components/shared/SearchBar";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import type {
  PlaceSearchItem,
  PlacesApiResponse,
} from "@/src/lib/google/places/types";
import {
  clearReferenceLocation,
  getReferenceLocation,
  updateReferenceLocation,
  type ReferenceLocation,
} from "@/src/services/groups/group.service";

type LoadStatus = "loading" | "ready" | "error" | "no-group";
type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type PreviewLocation = {
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const TOAST_MS = 1800;
const SUCCESS_NAVIGATE_MS = 700;

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

function hasLocation(
  location: Pick<ReferenceLocation, "name" | "lat" | "lng"> | null,
): location is ReferenceLocation & {
  name: string;
  lat: number;
  lng: number;
} {
  return (
    location != null &&
    typeof location.name === "string" &&
    location.name.trim().length > 0 &&
    location.lat != null &&
    location.lng != null &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng)
  );
}

function mapPreviewSrc(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&hl=zh-TW&output=embed`;
}

function MapPreview({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border">
      <iframe
        title={title}
        src={mapPreviewSrc(lat, lng)}
        className="pointer-events-none h-[150px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function LocationSettingsPage() {
  const router = useRouter();
  const { syncAfterGroupChange } = useCurrentGroup();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [location, setLocation] = useState<ReferenceLocation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchItem[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [preview, setPreview] = useState<PreviewLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
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

  async function loadLocation() {
    setStatus("loading");

    try {
      const { data, error } = await getReferenceLocation();

      if (error) {
        setLocation(null);
        setStatus("error");
        return;
      }

      if (!data) {
        setLocation(null);
        setStatus("no-group");
        return;
      }

      setLocation(data);
      setIsEditing(!hasLocation(data));
      setStatus("ready");
    } catch {
      setLocation(null);
      setStatus("error");
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadLocation();
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!isEditing || trimmed.length < MIN_QUERY_LENGTH) {
      const frame = window.requestAnimationFrame(() => {
        setResults([]);
        setSearchStatus("idle");
      });
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchStatus("loading");
      setResults([]);

      try {
        const response = await fetch("/api/google/places/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as PlacesApiResponse<
          PlaceSearchItem[]
        >;

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok || payload.error || !payload.data) {
          setResults([]);
          setSearchStatus(response.status === 404 ? "empty" : "error");
          return;
        }

        if (payload.data.length === 0) {
          setResults([]);
          setSearchStatus("empty");
          return;
        }

        setResults(payload.data);
        setSearchStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
        setSearchStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, isEditing]);

  function handleSelectPlace(place: PlaceSearchItem) {
    if (place.latitude == null || place.longitude == null) {
      showToast("error", "更新失敗，請稍後再試。");
      return;
    }

    setPreview({
      name: place.name.trim() || place.address.trim() || "選取的位置",
      lat: place.latitude,
      lng: place.longitude,
      address: place.address.trim() || undefined,
    });
    setQuery("");
    setResults([]);
    setSearchStatus("idle");
  }

  async function handleSave() {
    if (!preview || saving) {
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await updateReferenceLocation({
        name: preview.name,
        lat: preview.lat,
        lng: preview.lng,
      });

      if (error || !data || !hasLocation(data)) {
        showToast("error", "更新失敗，請稍後再試。");
        return;
      }

      setLocation(data);
      setPreview(null);
      setIsEditing(false);
      await syncAfterGroupChange();
      showToast("success", "預設位置已更新。");

      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
      navigateTimerRef.current = window.setTimeout(() => {
        router.replace("/settings");
        navigateTimerRef.current = null;
      }, SUCCESS_NAVIGATE_MS);
    } catch {
      showToast("error", "更新失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (clearing) {
      return;
    }

    setClearing(true);

    try {
      const { data, error } = await clearReferenceLocation();

      if (error || !data) {
        showToast("error", "更新失敗，請稍後再試。");
        return;
      }

      setLocation(data);
      setPreview(null);
      setIsEditing(true);
      await syncAfterGroupChange();
      showToast("success", "已清除預設位置。");
    } catch {
      showToast("error", "更新失敗，請稍後再試。");
    } finally {
      setClearing(false);
    }
  }

  const configured = hasLocation(location);
  const showSearch = status === "ready" && (isEditing || !configured);
  const showCurrent = status === "ready" && configured && !isEditing;

  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/settings"
          aria-label="返回設定"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          預設位置
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4 pb-8">
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-deep-brown">
            預設位置
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            設定群組共同的參考位置，
            <br />
            之後將用來計算餐廳距離，
            <br />
            以及「今天吃什麼」功能。
          </p>
        </div>

        {status === "loading" ? (
          <div className="mt-6 animate-pulse space-y-3" aria-hidden>
            <div className="h-28 rounded-2xl bg-border/80" />
            <div className="h-12 rounded-full bg-border/70" />
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-medium text-cocoa">載入失敗</p>
            <button
              type="button"
              onClick={() => {
                void loadLocation();
              }}
              className="rounded-full bg-caramel px-6 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {status === "no-group" ? (
          <div className="mt-8 rounded-2xl border border-border bg-rice-white px-4 py-8 text-center shadow-soft">
            <p className="text-sm text-cocoa">請先選擇或建立群組。</p>
            <Link
              href="/settings/groups"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-caramel px-6 text-sm font-bold text-rice-white shadow-button"
            >
              前往群組管理
            </Link>
          </div>
        ) : null}

        {showCurrent && hasLocation(location) ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
            <div className="px-4 py-5">
              <p className="font-display text-lg font-bold text-deep-brown">
                🏠 {location.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                目前所有成員都會以此位置計算餐廳距離。
              </p>
              <MapPreview
                lat={location.lat}
                lng={location.lng}
                title={`${location.name} 地圖預覽`}
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setPreview(null);
                    setQuery("");
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-rice-white text-sm font-bold text-deep-brown shadow-soft"
                >
                  重新設定
                </button>
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => {
                    void handleClear();
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg text-sm font-bold text-cocoa disabled:opacity-70"
                >
                  {clearing ? "清除中…" : "清除"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showSearch ? (
          <div className="mt-6 space-y-3">
            {configured ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPreview(null);
                  setQuery("");
                  setResults([]);
                  setSearchStatus("idle");
                }}
                className="text-sm font-medium text-caramel"
              >
                ← 返回目前設定
              </button>
            ) : null}

            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="搜尋地址、地標、捷運站..."
            />

            {query.trim().length >= MIN_QUERY_LENGTH &&
            searchStatus !== "idle" ? (
              <div
                role="listbox"
                aria-label="地點搜尋結果"
                className="max-h-56 overflow-y-auto rounded-2xl border border-border bg-rice-white shadow-soft"
              >
                {searchStatus === "loading" ? (
                  <p className="px-4 py-4 text-center text-sm text-text-secondary">
                    搜尋中...
                  </p>
                ) : null}
                {searchStatus === "empty" ? (
                  <p className="px-4 py-4 text-center text-sm text-text-secondary">
                    找不到符合的地點
                  </p>
                ) : null}
                {searchStatus === "error" ? (
                  <p className="px-4 py-4 text-center text-sm text-text-secondary">
                    搜尋失敗，請稍後再試。
                  </p>
                ) : null}
                {searchStatus === "ready" ? (
                  <ul className="divide-y divide-border/70">
                    {results.map((place) => (
                      <li key={place.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => handleSelectPlace(place)}
                          className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-cream-bg"
                        >
                          <span className="text-sm font-medium text-deep-brown">
                            {place.name}
                          </span>
                          {place.address ? (
                            <span className="text-xs text-text-secondary">
                              {place.address}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {preview ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
            <div className="px-4 py-5">
              <p className="font-display text-lg font-bold text-deep-brown">
                🏠 {preview.name}
              </p>
              {preview.address ? (
                <p className="mt-1 text-xs text-text-secondary">
                  {preview.address}
                </p>
              ) : null}
              <MapPreview
                lat={preview.lat}
                lng={preview.lng}
                title={`${preview.name} 地圖預覽`}
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  void handleSave();
                }}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              >
                {saving ? "儲存中…" : "儲存預設位置"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

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
