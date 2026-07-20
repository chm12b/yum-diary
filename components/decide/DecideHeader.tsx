import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft transition-transform active:scale-[0.98]";

export default function DecideHeader() {
  return (
    <header className="relative">
      <div className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/"
          aria-label="返回首頁"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-lg font-bold text-deep-brown">
          今天吃什麼？
        </h1>
        <div />
      </div>
    </header>
  );
}
