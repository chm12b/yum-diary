"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getGroupDetail,
  listGroupMembers,
  type GroupMemberListItem,
} from "@/src/services/groups/group.service";

type GroupMembersPageProps = {
  groupId: string;
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

function RowDivider() {
  return <div className="border-t border-dashed border-border" />;
}

export default function GroupMembersPage({
  groupId,
}: GroupMembersPageProps) {
  const [members, setMembers] = useState<GroupMemberListItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function load() {
    setStatus("loading");

    try {
      const [groupResult, membersResult] = await Promise.all([
        getGroupDetail(groupId),
        listGroupMembers(groupId),
      ]);

      if (groupResult.error || membersResult.error) {
        setMembers([]);
        setStatus("error");
        return;
      }

      if (!groupResult.data) {
        setMembers([]);
        setStatus("not-found");
        return;
      }

      setMembers(membersResult.data);
      setStatus("ready");
    } catch {
      setMembers([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void load();
  }, [groupId]);

  return (
    <div className="home-grid-bg min-h-full">
      <header className="px-5 pt-4 pb-2">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <Link
            href={`/settings/groups/${groupId}`}
            aria-label="返回群組"
            className="flex items-center gap-1 justify-self-start text-deep-brown transition-transform active:scale-[0.98]"
          >
            <span className={iconButtonClass}>
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-xs font-medium text-cocoa">返回群組</span>
          </Link>
          <h1 className="text-center font-display text-base font-bold text-deep-brown">
            成員
          </h1>
          <span className="w-[5.25rem]" aria-hidden />
        </div>
        {status === "ready" ? (
          <p className="mt-1 text-center text-xs text-text-secondary">
            共 {members.length} 位成員
          </p>
        ) : null}
      </header>

      <section className="px-5 pt-4 pb-8">
        {status === "loading" ? (
          <div
            className="animate-pulse overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft"
            aria-hidden
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className={`h-[4.5rem] bg-border/35 ${
                  index > 0 ? "border-t border-dashed border-border" : ""
                }`}
              />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm text-cocoa">載入成員失敗</p>
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

        {status === "not-found" ? (
          <div className="rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm text-cocoa">找不到這個群組</p>
          </div>
        ) : null}

        {status === "ready" && members.length === 0 ? (
          <div className="rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
            <p className="text-sm text-cocoa/70">還沒有任何成員。</p>
          </div>
        ) : null}

        {status === "ready" && members.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
            {members.map((member, index) => (
              <div key={member.profileId}>
                {index > 0 ? <RowDivider /> : null}
                <div className="px-4 py-3.5">
                  <p className="truncate text-base font-medium text-deep-brown">
                    {member.displayName}
                    {member.isCurrentUser ? "（你）" : ""}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {member.isOwner ? "群組建立者" : "成員"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
