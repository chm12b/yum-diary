"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { homeAssets } from "@/src/lib/home-assets";
import {
  getInvitePreview,
  joinGroupByInviteCode,
  listMyGroups,
} from "@/src/services/groups/group.service";

const MAX_CODE_LENGTH = 6;
const INVITE_CODE_PATTERN = /^[A-Z0-9]{6}$/;
const TOAST_MS = 1800;
const SUCCESS_NAVIGATE_MS = 900;

export default function JoinGroupForm() {
  const router = useRouter();
  const { switchGroup } = useCurrentGroup();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (navigateTimerRef.current != null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  function goHomeSoon() {
    if (navigateTimerRef.current != null) {
      window.clearTimeout(navigateTimerRef.current);
    }
    navigateTimerRef.current = window.setTimeout(() => {
      router.replace("/");
      navigateTimerRef.current = null;
    }, SUCCESS_NAVIGATE_MS);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmed = code.trim().toUpperCase();
    setCode(trimmed);
    setError(null);

    if (!trimmed) {
      setError("請輸入邀請碼");
      return;
    }

    if (!INVITE_CODE_PATTERN.test(trimmed)) {
      setError("請輸入 6 碼大寫英數字邀請碼");
      return;
    }

    setSubmitting(true);

    try {
      const { data: preview, error: previewError } =
        await getInvitePreview(trimmed);

      if (previewError || !preview) {
        setError("邀請碼無效，請再確認一次");
        return;
      }

      const { data: mine } = await listMyGroups();
      const alreadyMember = mine.some(
        (group) => group.id === preview.groupId,
      );

      if (alreadyMember) {
        await switchGroup(preview.groupId);
        showToast(`你已經是「${preview.groupName}」的成員了。`);
        goHomeSoon();
        return;
      }

      const { data: groupId, error: joinError } =
        await joinGroupByInviteCode(trimmed);

      if (joinError || !groupId) {
        setError("邀請碼無效或無法加入，請再確認一次");
        return;
      }

      await switchGroup(groupId);
      showToast(`歡迎加入「${preview.groupName}」。`);
      goHomeSoon();
    } catch {
      setError("加入失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="w-full" onSubmit={handleSubmit}>
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
            maxLength={MAX_CODE_LENGTH}
            onChange={(event) => {
              setCode(event.target.value.trim().toUpperCase());
              if (error) {
                setError(null);
              }
            }}
            placeholder="請輸入邀請碼（例如：ABCDEFGH）"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            disabled={submitting}
            className="h-14 w-full rounded-[24px] border border-border bg-white px-5 pb-4 pt-3 text-base tracking-[0.18em] text-deep-brown uppercase placeholder:tracking-normal placeholder:text-soft-gray transition-colors focus:border-caramel focus:outline-none disabled:opacity-70"
          />
          <span className="pointer-events-none absolute right-4 bottom-2.5 text-xs text-soft-gray">
            {code.length} / {MAX_CODE_LENGTH}
          </span>
        </div>

        <p className="mt-3 text-xs text-text-secondary">
          邀請碼由 6 個大寫英數字組成
        </p>

        {error ? (
          <p className="mt-3 text-center text-sm text-cocoa" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || code.trim().length === 0}
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
          {submitting ? "加入中…" : "加入群組"}
        </button>
      </form>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-8 z-50 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-caramel/30 bg-sakura-pink/80 px-4 py-3 text-center text-sm font-medium text-deep-brown shadow-card"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
