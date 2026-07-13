"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createGroup } from "@/src/services/groups/group.service";
import { homeAssets } from "@/src/lib/home-assets";

const MAX_NAME_LENGTH = 100;
const INVITE_CODE_LENGTH = 6;
const INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateInviteCode(): string {
  const values = crypto.getRandomValues(new Uint32Array(INVITE_CODE_LENGTH));
  let code = "";

  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    code += INVITE_CODE_CHARS[values[index]! % INVITE_CODE_CHARS.length];
  }

  return code;
}

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: createError } = await createGroup({
        groupName: name,
        inviteCode: generateInviteCode(),
      });

      if (createError) {
        setError("建立群組失敗");
        return;
      }

      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="group-name"
          className="block text-sm font-medium text-deep-brown"
        >
          群組名稱
        </label>

        <div className="relative">
          <input
            id="group-name"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：我們家"
            autoComplete="off"
            className="h-14 w-full rounded-[24px] border border-border bg-white px-5 pb-4 pt-3 text-base text-deep-brown placeholder:text-soft-gray transition-colors focus:border-caramel focus:outline-none"
          />
          <span className="pointer-events-none absolute right-4 bottom-2.5 text-xs text-soft-gray">
            {name.length} / {MAX_NAME_LENGTH}
          </span>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-center text-sm text-cocoa" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-10 flex h-14 w-full items-center justify-center gap-1.5 rounded-[28px] bg-caramel text-base font-bold text-rice-white transition-[filter] hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
      >
        <Image
          src={homeAssets.loginButtonIcon}
          alt=""
          width={50}
          height={60}
          className="-mx-2.5 h-[52px] w-[44px] rotate-[10deg] object-contain"
          aria-hidden
        />
        {submitting ? "建立中..." : "建立群組"}
      </button>
    </form>
  );
}
