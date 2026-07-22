"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  GROUP_ORDER_DESCRIPTION_MAX,
  GROUP_ORDER_TITLE_MAX,
} from "@/src/services/group-order";

export type CreateGroupOrderFormValues = {
  title: string;
  closeAt: string;
  description: string;
};

type CreateGroupOrderDialogProps = {
  open: boolean;
  restaurantName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupOrderFormValues) => void | Promise<void>;
};

function defaultCloseAtLocal(): string {
  const date = new Date();
  date.setHours(date.getHours() + 2, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultTitle(restaurantName: string): string {
  const name = restaurantName.trim();
  if (!name) {
    return "揪團點餐";
  }
  return `${name} 點餐`.slice(0, GROUP_ORDER_TITLE_MAX);
}

type DialogBodyProps = {
  restaurantName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupOrderFormValues) => void | Promise<void>;
};

function CreateGroupOrderDialogBody({
  restaurantName,
  isSubmitting,
  onClose,
  onSubmit,
}: DialogBodyProps) {
  const [title, setTitle] = useState(() => defaultTitle(restaurantName));
  const [closeAt, setCloseAt] = useState(() => defaultCloseAtLocal());
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isSubmitting]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("請輸入標題");
      return;
    }
    if (!closeAt) {
      setError("請選擇截止時間");
      return;
    }

    const closeDate = new Date(closeAt);
    if (Number.isNaN(closeDate.getTime())) {
      setError("截止時間格式錯誤");
      return;
    }
    if (closeDate.getTime() <= Date.now()) {
      setError("截止時間需晚於現在");
      return;
    }

    setError(null);
    await onSubmit({
      title: trimmedTitle,
      closeAt,
      description: description.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep-brown/40 px-3 pb-[calc(var(--bottom-nav-height)+1rem)] sm:items-center sm:px-4 sm:pb-0"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-order-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-rice-white shadow-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id="create-group-order-title"
            className="font-display text-base font-bold text-deep-brown"
          >
            🍽 發起點餐
          </h2>
          <p className="mt-1 truncate text-xs text-text-secondary">
            {restaurantName}
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="px-5 py-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-deep-brown">標題</span>
            <input
              type="text"
              value={title}
              maxLength={GROUP_ORDER_TITLE_MAX}
              disabled={isSubmitting}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-cream-bg/40 px-3 py-2.5 text-sm text-deep-brown outline-none transition-colors focus:border-caramel disabled:opacity-70"
              placeholder="例如：中午一起訂飲料"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">截止時間</span>
            <input
              type="datetime-local"
              value={closeAt}
              disabled={isSubmitting}
              onChange={(event) => setCloseAt(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-cream-bg/40 px-3 py-2.5 text-sm text-deep-brown outline-none transition-colors focus:border-caramel disabled:opacity-70"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-deep-brown">
              說明
              <span className="ml-1 font-normal text-text-secondary">
                （選填）
              </span>
            </span>
            <textarea
              value={description}
              maxLength={GROUP_ORDER_DESCRIPTION_MAX}
              disabled={isSubmitting}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-cream-bg/40 px-3 py-2.5 text-sm text-deep-brown outline-none transition-colors focus:border-caramel disabled:opacity-70"
              placeholder="例如：飲料我來訂，大家留言口味"
            />
          </label>

          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg disabled:opacity-70"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "建立中…" : "建立"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateGroupOrderDialog({
  open,
  restaurantName,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CreateGroupOrderDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <CreateGroupOrderDialogBody
      key={restaurantName}
      restaurantName={restaurantName}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
