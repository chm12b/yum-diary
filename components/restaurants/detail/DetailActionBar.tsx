"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CreateGroupOrderDialog, {
  type CreateGroupOrderFormValues,
} from "@/components/group-order/CreateGroupOrderDialog";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { createGroupOrder } from "@/src/services/group-order";
import { listMenuItems } from "@/src/services/menu-item";

type DetailActionBarProps = {
  restaurantId: string;
  restaurantName: string;
  onToast: (type: "success" | "error", message: string) => void;
};

const quickActionClass =
  "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sakura-pink text-[15px] font-bold tracking-[0.5px] text-deep-brown shadow-pink-button transition-transform active:scale-[0.98]";

const MENU_REQUIRED_TOAST_MS = 4500;

export default function DetailActionBar({
  restaurantId,
  restaurantName,
  onToast,
}: DetailActionBarProps) {
  const router = useRouter();
  const { currentGroupId } = useCurrentGroup();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingMenu, setCheckingMenu] = useState(false);
  const [menuRequiredToast, setMenuRequiredToast] = useState(false);
  const menuToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (menuToastTimerRef.current != null) {
        window.clearTimeout(menuToastTimerRef.current);
      }
    };
  }, []);

  const handleOpenCreate = useCallback(async () => {
    if (checkingMenu) {
      return;
    }

    setCheckingMenu(true);
    try {
      const items = await listMenuItems(restaurantId);
      if (items.length === 0) {
        setMenuRequiredToast(true);
        if (menuToastTimerRef.current != null) {
          window.clearTimeout(menuToastTimerRef.current);
        }
        menuToastTimerRef.current = window.setTimeout(() => {
          setMenuRequiredToast(false);
          menuToastTimerRef.current = null;
        }, MENU_REQUIRED_TOAST_MS);
        return;
      }
      setOpen(true);
    } catch {
      onToast("error", "無法確認菜單品項，請稍後再試");
    } finally {
      setCheckingMenu(false);
    }
  }, [checkingMenu, onToast, restaurantId]);

  const handleSubmit = useCallback(
    async (values: CreateGroupOrderFormValues) => {
      if (!currentGroupId) {
        onToast("error", "請先選擇群組");
        return;
      }
      if (submitting) {
        return;
      }

      setSubmitting(true);
      try {
        const order = await createGroupOrder({
          groupId: currentGroupId,
          restaurantId,
          title: values.title,
          description: values.description || null,
          closeAt: values.closeAt,
        });
        setOpen(false);
        router.push(`/orders/${order.id}`);
      } catch {
        onToast("error", "建立點餐失敗");
        setSubmitting(false);
      }
    },
    [currentGroupId, onToast, restaurantId, router, submitting],
  );

  return (
    <section className="-mt-[10px] px-5 pt-4 pb-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/restaurants/${restaurantId}/records/new`}
          className={quickActionClass}
        >
          <span aria-hidden>✏️</span>
          新增美食日記
        </Link>
        <button
          type="button"
          onClick={() => {
            void handleOpenCreate();
          }}
          disabled={checkingMenu}
          className={quickActionClass}
        >
          <span aria-hidden>🍽</span>
          揪團點餐
        </button>
      </div>

      <CreateGroupOrderDialog
        open={open}
        restaurantName={restaurantName}
        isSubmitting={submitting}
        onClose={() => {
          if (!submitting) {
            setOpen(false);
          }
        }}
        onSubmit={handleSubmit}
      />

      {menuRequiredToast ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-50 mx-auto flex w-[min(100%-2rem,28rem)] flex-col items-center gap-2 rounded-2xl border border-border bg-rice-white px-4 py-3 text-center text-sm font-medium text-cocoa shadow-card"
        >
          <p>請先建立菜單品項，才能發起共同點餐。</p>
          <Link
            href={`/restaurants/${restaurantId}/menu`}
            className="inline-flex h-9 items-center justify-center rounded-full border border-caramel bg-sakura-pink/80 px-4 text-sm font-bold text-deep-brown transition-transform active:scale-[0.98]"
            onClick={() => setMenuRequiredToast(false)}
          >
            前往菜單品項
          </Link>
        </div>
      ) : null}
    </section>
  );
}
