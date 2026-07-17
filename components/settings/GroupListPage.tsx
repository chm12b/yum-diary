"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  getCurrentGroup,
  listMyGroups,
  type GroupListItem,
} from "@/src/services/groups/group.service";

type LoadStatus = "loading" | "ready" | "error";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

function RowDivider() {
  return <div className="border-t border-dashed border-border" />;
}

export default function GroupListPage() {
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function load() {
    setStatus("loading");

    try {
      const [groupsResult, currentResult] = await Promise.all([
        listMyGroups(),
        getCurrentGroup(),
      ]);

      if (groupsResult.error) {
        setStatus("error");
        return;
      }

      setGroups(groupsResult.data);
      setCurrentGroupId(currentResult.data?.id ?? null);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
          我的群組
        </h1>
        <span aria-hidden />
      </header>

      <section className="space-y-4 px-5 pt-4 pb-8">
        {status === "loading" ? (
          <div
            className="animate-pulse overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft"
            aria-hidden
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className={`h-14 bg-border/40 ${
                  index > 0 ? "border-t border-dashed border-border" : ""
                }`}
              />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm text-cocoa">載入群組失敗</p>
            <button
              type="button"
              onClick={() => {
                void load();
              }}
              className="mt-3 rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {status === "ready" && groups.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm text-cocoa/70">還沒有任何群組。</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/groups/create"
                className="rounded-full bg-caramel px-5 py-2.5 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                建立第一個群組
              </Link>
              <Link
                href="/groups/join"
                className="rounded-full border border-border bg-cream-bg/60 px-5 py-2.5 text-sm font-medium text-deep-brown transition-colors hover:bg-cream-bg"
              >
                加入其他群組
              </Link>
            </div>
          </div>
        ) : null}

        {status === "ready" && groups.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
              {groups.map((group, index) => {
                const isCurrent = group.id === currentGroupId;

                return (
                  <div key={group.id}>
                    {index > 0 ? <RowDivider /> : null}
                    <Link
                      href={`/settings/groups/${group.id}`}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
                    >
                      {isCurrent ? (
                        <span
                          className="w-4 shrink-0 text-sm font-bold text-caramel"
                          aria-label="目前使用中"
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 shrink-0" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 truncate text-base font-medium text-deep-brown">
                        {group.name}
                      </span>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-cocoa"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
              <Link
                href="/groups/create"
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
              >
                <span className="text-base leading-none" aria-hidden>
                  ➕
                </span>
                <span className="min-w-0 flex-1 text-base font-medium text-deep-brown">
                  建立新群組
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-cocoa"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
              <RowDivider />
              <Link
                href="/groups/join"
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-cream-bg/40 active:bg-cream-bg/60"
              >
                <span className="text-base leading-none" aria-hidden>
                  🔑
                </span>
                <span className="min-w-0 flex-1 text-base font-medium text-deep-brown">
                  加入其他群組
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-cocoa"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
