"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";

import { getCurrentGroup } from "@/src/services/groups/group.service";

export default function TopBar() {
  const [groupName, setGroupName] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentGroup() {
      const { data } = await getCurrentGroup();
      setGroupName(data?.name ?? null);
    }

    void loadCurrentGroup();
  }, []);

  const label = groupName ?? "我的群組";

  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-1">
      <button
        type="button"
        aria-label="開啟選單"
        className="flex h-10 w-10 items-center justify-center justify-self-start text-text-primary transition-transform active:scale-[0.98]"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label={`目前群組：${label}`}
        className="flex max-w-full items-center justify-center gap-1 justify-self-center text-text-primary transition-transform active:scale-[0.98]"
      >
        <span aria-hidden className="text-base leading-none">
          🏠
        </span>
        <span className="max-w-[9.5rem] truncate font-mono text-base">{label}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-text-secondary"
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      <button
        type="button"
        aria-label="通知"
        className="flex h-10 w-10 items-center justify-center justify-self-end text-text-primary transition-transform active:scale-[0.98]"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
