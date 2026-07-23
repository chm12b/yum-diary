import type { Database } from "@/src/types/database";

export type GroupOrderParticipantRecord =
  Database["public"]["Tables"]["group_order_participants"]["Row"];

export type GroupOrderParticipantInsert =
  Database["public"]["Tables"]["group_order_participants"]["Insert"];

/** UI-facing group order participant (camelCase). */
export type GroupOrderParticipant = {
  id: string;
  groupOrderId: string;
  userId: string;
  joinedAt: string;
  createdAt: string;
};

export type CreateParticipantInput = {
  groupOrderId: string;
};
