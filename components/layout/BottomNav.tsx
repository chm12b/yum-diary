"use client";

import { Heart, Home, Store, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItemId } from "@/src/lib/nav-data";
import { navItems } from "@/src/lib/nav-data";

const navIcons: Record<NavItemId, LucideIcon> = {
  home: Home,
  restaurants: Store,
  favorites: Heart,
  profile: User,
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 h-bottom-nav bg-khaki">
      <div className="mx-auto flex h-full max-w-app items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = navIcons[item.id];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-w-14 flex-col items-center gap-1"
            >
              <Icon
                className={`h-6 w-6 ${isActive ? "text-deep-brown" : "text-cocoa/70"}`}
                strokeWidth={2}
              />
              <span
                className={`text-xs ${
                  isActive ? "font-medium text-deep-brown" : "text-cocoa/70"
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
