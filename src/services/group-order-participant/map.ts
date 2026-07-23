import type {
  GroupOrderParticipant,
  GroupOrderParticipantRecord,
} from "./types";

export function toGroupOrderParticipant(
  row: GroupOrderParticipantRecord,
): GroupOrderParticipant {
  return {
    id: row.id,
    groupOrderId: row.group_order_id,
    userId: row.user_id,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
  };
}
