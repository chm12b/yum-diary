import { createClient } from "@/src/lib/supabase/client";

import { getGroupOrder } from "./getGroupOrder";
import { toGroupOrder } from "./map";
import { normalizeCloseAt } from "./normalize";
import type { GroupOrder } from "./types";

export const EXTEND_DEADLINE_OPTIONS_MINUTES = [5, 10, 15, 30] as const;

export type ExtendDeadlineMinutes =
  (typeof EXTEND_DEADLINE_OPTIONS_MINUTES)[number];

export type ExtendGroupOrderDeadlineInput = {
  id: string;
  minutes: ExtendDeadlineMinutes;
};

/**
 * Host-only: extend close_at by N minutes and reopen as OPEN.
 * Base time is max(close_at, now) so a past deadline still yields a future close_at.
 */
export async function extendGroupOrderDeadline(
  input: ExtendGroupOrderDeadlineInput,
): Promise<GroupOrder> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  if (
    !(EXTEND_DEADLINE_OPTIONS_MINUTES as readonly number[]).includes(
      input.minutes,
    )
  ) {
    throw new Error("Invalid minutes");
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("Not authenticated");
  }

  const order = await getGroupOrder(id);
  if (!order) {
    throw new Error("Group order not found");
  }

  if (order.createdBy !== user.id) {
    throw new Error("Only the host can extend the deadline");
  }

  if (order.status === "COMPLETED") {
    throw new Error("Completed group order cannot be extended");
  }

  if (order.status !== "CLOSED") {
    throw new Error("Only a closed group order can be extended");
  }

  const closeAtMs = new Date(order.closeAt).getTime();
  if (Number.isNaN(closeAtMs)) {
    throw new Error("Invalid closeAt");
  }

  const baseMs = Math.max(closeAtMs, Date.now());
  const nextCloseAt = new Date(baseMs + input.minutes * 60_000);

  const { data, error } = await supabase
    .from("group_orders")
    .update({
      close_at: normalizeCloseAt(nextCloseAt),
      status: "OPEN",
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to extend group order deadline");
  }

  return toGroupOrder(data);
}
