"use client";

import { Search } from "lucide-react";

type MenuSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function MenuSearchBar({
  value,
  onChange,
  placeholder = "搜尋品項...",
}: MenuSearchBarProps) {
  return (
    <div className="flex h-12 items-center gap-1 rounded-full border border-border bg-rice-white pl-4 pr-4 shadow-soft">
      <Search
        className="h-5 w-5 shrink-0 text-text-secondary"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent px-2 text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
      />
    </div>
  );
}
