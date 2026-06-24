"use client";

import { Search } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
};

export default function SearchBar({
  placeholder = "搜尋餐廳、料理或地點...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  return (
    <section className="px-5 pt-6 pb-8">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-cocoa"
          strokeWidth={2}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-full bg-rice-white pr-4 pl-11 text-base text-deep-brown placeholder:text-cocoa/60 focus:outline-none"
        />
      </div>
    </section>
  );
}
