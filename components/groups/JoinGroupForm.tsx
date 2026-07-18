"use client";

import Image from "next/image";
import { useState } from "react";

import { homeAssets } from "@/src/lib/home-assets";

const MAX_CODE_LENGTH = 6;

export default function JoinGroupForm() {
  const [code, setCode] = useState("");

  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label
        htmlFor="invite-code"
        className="mb-2 block text-sm font-medium text-deep-brown"
      >
        邀請碼
      </label>

      <div className="relative">
        <input
          id="invite-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="請輸入邀請碼（例如：ABCDEFGH）"
          autoComplete="off"
          spellCheck={false}
          className="h-14 w-full rounded-[24px] border border-border bg-white px-5 pb-4 pt-3 text-base text-deep-brown placeholder:text-soft-gray transition-colors focus:border-caramel focus:outline-none"
        />
        <span className="pointer-events-none absolute right-4 bottom-2.5 text-xs text-soft-gray">
          {code.length} / {MAX_CODE_LENGTH}
        </span>
      </div>

      <p className="mt-3 text-xs text-text-secondary">
        邀請碼由 6 個大寫英數字組成
      </p>

      <button
        type="button"
        onClick={() => {}}
        className="mt-10 flex h-14 w-full items-center justify-center gap-1.5 rounded-[28px] bg-caramel text-base font-bold text-rice-white transition-[filter] hover:brightness-110 active:scale-[0.99]"
      >
        <Image
          src={homeAssets.loginButtonIcon}
          alt=""
          width={50}
          height={60}
          className="-mx-2.5 h-[52px] w-[44px] rotate-[10deg] object-contain"
          aria-hidden
        />
        加入群組
      </button>
    </form>
  );
}
