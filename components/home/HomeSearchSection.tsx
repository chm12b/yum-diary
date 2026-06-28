"use client";

import Image from "next/image";
import { useState } from "react";

import SearchBar from "@/components/shared/SearchBar";
import { homeAssets } from "@/src/lib/home-assets";

export default function HomeSearchSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="flex flex-col gap-4 px-5 pt-5 pb-10">
      <div className="relative">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜尋料理、餐廳或地點..."
        />
        <Image
          src={homeAssets.stickerFlowerPink}
          alt=""
          width={32}
          height={32}
          aria-hidden
          className="pointer-events-none absolute -top-2 -right-1 rotate-12"
        />
      </div>
    </section>
  );
}
