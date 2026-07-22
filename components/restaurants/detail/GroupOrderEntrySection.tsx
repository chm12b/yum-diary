"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import CreateGroupOrderDialog, {
  type CreateGroupOrderFormValues,
} from "@/components/group-order/CreateGroupOrderDialog";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";
import { createGroupOrder } from "@/src/services/group-order";

type GroupOrderEntrySectionProps = {
  restaurantId: string;
  restaurantName: string;
  onToast: (type: "success" | "error", message: string) => void;
};

/** Restaurant Detail — create a group order for this restaurant. */
export default function GroupOrderEntrySection({
  restaurantId,
  restaurantName,
  onToast,
}: GroupOrderEntrySectionProps) {
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
    <section className="px-5 pt-5">
      <h2 className="-mt-[10px] -mb-[2px] text-base font-bold text-deep-brown">
        🍽 揪團點餐
      </h2>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-rice-white px-4 py-4 shadow-soft">
        <div className="min-w-0">
          <p className="text-sm font-medium text-deep-brown">發起點餐活動</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            邀請群組成員一起點這家店
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full bg-caramel px-4 py-2 text-xs font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          🍽 發起點餐
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
