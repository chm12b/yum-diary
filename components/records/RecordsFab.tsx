import Link from "next/link";

type RecordsFabProps = {
  restaurantId: string;
};

export default function RecordsFab({ restaurantId }: RecordsFabProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app">
      <div className="pointer-events-auto absolute right-5 bottom-[calc(var(--bottom-nav-height)+0.75rem)] flex flex-col items-center gap-1">
        <Link
          href={`/records/${restaurantId}/new`}
          aria-label="新增紀錄"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-sakura-pink shadow-pink-button transition-transform active:scale-[0.98]"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-text-primary"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
        <span className="text-xs font-medium text-deep-brown">新增紀錄</span>
      </div>
    </div>
  );
}
