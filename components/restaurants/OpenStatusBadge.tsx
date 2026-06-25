type OpenStatusBadgeProps = {
  isOpen: boolean;
};

export default function OpenStatusBadge({ isOpen }: OpenStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs ${
        isOpen ? "bg-warm-gray text-deep-brown" : "bg-soft-gray text-cocoa"
      }`}
    >
      {isOpen ? "營業中" : "已打烊"}
    </span>
  );
}
