import Link from "next/link";
import type { ReactNode } from "react";

type EntryCardProps = {
  href: string;
  label: string;
  leading?: ReactNode;
};

export default function EntryCard({ href, label, leading }: EntryCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl bg-rice-white px-5 py-5 shadow-card"
    >
      {leading ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-milk-tea text-2xl leading-none">
          {leading}
        </span>
      ) : null}
      <span className="text-base font-medium tracking-wide text-deep-brown">
        {label}
      </span>
    </Link>
  );
}
