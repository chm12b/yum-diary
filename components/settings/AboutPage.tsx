import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const APP_NAME = "Yum Diary";
const APP_VERSION = "0.1.0";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function AboutPage() {
  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href="/settings"
          aria-label="返回設定"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="text-center font-display text-base font-bold text-deep-brown">
          關於
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
          <div className="space-y-4 px-4 py-6 text-center">
            <p className="font-display text-lg font-bold text-deep-brown">
              {APP_NAME}
            </p>
            <p className="text-sm text-cocoa">Version {APP_VERSION}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
