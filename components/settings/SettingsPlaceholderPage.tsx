import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SettingsPlaceholderPageProps = {
  title: string;
  backHref?: string;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

/** Temporary stub for Settings sub-routes implemented in a later sprint. */
export default function SettingsPlaceholderPage({
  title,
  backHref = "/settings",
}: SettingsPlaceholderPageProps) {
  return (
    <div className="home-grid-bg min-h-full">
      <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
        <Link
          href={backHref}
          aria-label="返回"
          className={`${iconButtonClass} justify-self-start`}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="truncate text-center font-display text-base font-bold text-deep-brown">
          {title}
        </h1>
        <span aria-hidden />
      </header>

      <section className="px-5 pt-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-rice-white px-4 py-10 text-center shadow-soft">
          <p className="text-sm text-cocoa/70">Coming Soon</p>
        </div>
      </section>
    </div>
  );
}
