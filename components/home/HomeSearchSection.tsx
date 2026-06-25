"use client";

import { useState } from "react";

import SearchBar from "@/components/shared/SearchBar";

export default function HomeSearchSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="px-5 pt-6 pb-8">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
    </section>
  );
}
