"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import AddRestaurantBunnyHero from "@/components/add-restaurant/AddRestaurantBunnyHero";
import type {
  PlaceSearchItem,
  PlacesApiResponse,
} from "@/src/lib/google/places/types";

type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";

type AddRestaurantGoogleSearchProps = {
  onSelectPlaceId?: (placeId: string) => void;
  /** Shown briefly after successful Google autofill. */
  fillNotice?: boolean;
  detailLoading?: boolean;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function AddRestaurantGoogleSearch({
  onSelectPlaceId,
  fillNotice = false,
  detailLoading = false,
}: AddRestaurantGoogleSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setResults([]);

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
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
          if (response.status === 404) {
            setResults([]);
            setStatus("empty");
            return;
          }

          setResults([]);
          setStatus("error");
          return;
        }

        if (payload.data.length === 0) {
          setResults([]);
          setStatus("empty");
          return;
        }

        setResults(payload.data);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setResults([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleSelect(place: PlaceSearchItem) {
    setSelectedPlaceId(place.id);
    onSelectPlaceId?.(place.id);
    setResults([]);
    setStatus("idle");
  }

  const showDropdown =
    query.trim().length >= MIN_QUERY_LENGTH && status !== "idle";

  return (
    <section className="px-5 pt-1 pb-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-2 rounded-2xl border border-border bg-rice-white px-3.5 py-3 shadow-soft">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary"
              strokeWidth={2}
              aria-hidden
            />
            <input
              id="google-maps-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="輸入店名快速帶入資料..."
              aria-label="搜尋 Google Maps（選填）"
              aria-autocomplete="list"
              aria-controls="google-maps-search-results"
              autoComplete="off"
              spellCheck={false}
              disabled={detailLoading}
              className="h-11 w-full rounded-xl border border-border bg-cream-bg/60 pr-3 pl-9 text-sm text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40 disabled:opacity-60"
            />
          </div>
        </div>

        <AddRestaurantBunnyHero />
      </div>

      {detailLoading ? (
        <p className="mt-2 px-1 text-[11px] text-text-secondary/80">
          正在帶入 Google Maps 資料...
        </p>
      ) : null}

      {fillNotice ? (
        <p
          role="status"
          className="mt-2 rounded-xl border border-caramel/30 bg-sakura-pink/40 px-3 py-2 text-center text-[12px] font-medium text-deep-brown"
        >
          ✅ 已從 Google Maps 帶入餐廳資訊
        </p>
      ) : null}

      {showDropdown ? (
        <div
          id="google-maps-search-results"
          role="listbox"
          aria-label="Google Maps 搜尋結果"
          className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-dashed border-border bg-rice-white shadow-soft"
        >
          {status === "loading" ? (
            <p className="px-3 py-3 text-center text-[11px] text-text-secondary/80">
              搜尋中...
            </p>
          ) : null}

          {status === "empty" ? (
            <div className="px-3 py-3 text-center text-[11px] leading-relaxed text-text-secondary/80">
              <p>找不到符合的餐廳</p>
              <p>請直接填寫下方資料即可。</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="px-3 py-3 text-center text-[11px] leading-relaxed text-text-secondary/80">
              <p>搜尋失敗</p>
              <p>請稍後再試。</p>
            </div>
          ) : null}

          {status === "ready" ? (
            <ul className="divide-y divide-border/70">
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedPlaceId === place.id}
                    onClick={() => {
                      handleSelect(place);
                    }}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-cream-bg"
                  >
                    <span className="text-sm font-medium text-deep-brown">
                      {place.name}
                    </span>
                    {place.address ? (
                      <span className="text-[11px] text-text-secondary">
                        {place.address}
                      </span>
                    ) : null}
                    {place.rating != null ? (
                      <span className="text-[11px] text-caramel">
                        ★ {place.rating.toFixed(1)}
                        {place.reviewCount != null
                          ? `（${place.reviewCount}）`
                          : ""}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <input
        type="hidden"
        name="googlePlaceId"
        value={selectedPlaceId ?? ""}
        readOnly
      />
    </section>
  );
}
