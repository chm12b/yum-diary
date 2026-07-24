"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CreateGroupOrderDialog, {
  type CreateGroupOrderFormValues,
} from "@/components/group-order/CreateGroupOrderDialog";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { createGroupOrder } from "@/src/services/group-order";

type DetailActionBarProps = {
  restaurantId: string;
  restaurantName: string;
  onToast: (type: "success" | "error", message: string) => void;
};

const quickActionClass =
  "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sakura-pink text-[15px] font-bold tracking-[0.5px] text-deep-brown shadow-pink-button transition-transform active:scale-[0.98]";

export default function DetailActionBar({
  restaurantId,
  restaurantName,
  onToast,
}: DetailActionBarProps) {
  const router = useRouter();
  const { currentGroupId } = useCurrentGroup();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          onClick={() => setOpen(true)}
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
    </section>
  );
}
