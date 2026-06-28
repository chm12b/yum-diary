"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/src/lib/nav-data";

function FabPlusIcon() {
  return (
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
  );
}

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 h-bottom-nav border-t border-border bg-rice-white/95">
      <div className="relative mx-auto flex h-full max-w-app items-end justify-around px-2 pb-2">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                className="relative -top-5 flex h-14 w-14 shrink-0 translate-y-[5px] items-center justify-center gap-0 rounded-full border-2 border-border bg-sakura-pink shadow-pink-button transition-transform active:scale-[0.98]"
              >
                <FabPlusIcon />
              </button>
            );
          }

          const href = item.href!;
          const isActive = isNavActive(pathname, href);

          return (
            <Link
              key={item.id}
              href={href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-12 flex-1 flex-col items-center gap-1 transition-transform active:scale-[0.98]"
            >
              <span className="relative flex h-[72px] w-[80px] translate-y-[10px] items-center justify-center">
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute h-[60px] w-[60px] rounded-full bg-sakura-pink/40"
                  />
                ) : null}
                <Image
                  src={item.iconSrc!}
                  alt=""
                  width={80}
                  height={72}
                  aria-hidden
                  className={`relative z-10 h-[72px] w-[80px] object-contain ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                />
              </span>
              <span
                className={`text-xs font-medium leading-none ${
                  isActive ? "text-text-primary" : "text-text-secondary/70"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
