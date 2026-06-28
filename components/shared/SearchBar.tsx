"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  placeholder = "搜尋餐廳、料理或地點...",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-secondary"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="-my-[5px] h-12 w-full rounded-full border border-border bg-rice-white pr-4 pl-11 text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
      />
    </div>
  );
}
