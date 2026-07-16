import type { RestaurantOpenStatus } from "@/src/lib/restaurants/open-status";

type StatusBadgeProps = {
  status: RestaurantOpenStatus;
  className?: string;
};

const STATUS_CONFIG: Record<
  RestaurantOpenStatus,
  { label: string; className: string }
> = {
  open: {
    label: "營業中",
    className: "bg-status-open-bg text-status-open-fg",
  },
  closed: {
    label: "已打烊",
    className: "bg-status-closed-bg text-status-closed-fg",
  },
  holiday: {
    label: "公休日",
    className: "bg-status-holiday-bg text-status-holiday-fg",
  },
  unknown: {
    label: "未提供",
    className: "bg-status-unknown-bg text-status-unknown-fg",
  },
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const { label, className: toneClassName } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClassName} ${className}`}
    >
      {label}
    </span>
  );
}
