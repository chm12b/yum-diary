"use client";

import { ChevronRight, CirclePlus, Users, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export type ActionCardIcon = "circle-plus" | "users";

const iconMap: Record<ActionCardIcon, LucideIcon> = {
  "circle-plus": CirclePlus,
  users: Users,
};

type ActionCardProps = {
  iconName: ActionCardIcon;
  title: string;
  href: string;
  iconBackground: string;
  className?: string;
};

export default function ActionCard({
  iconName,
  title,
  href,
  iconBackground,
  className = "",
}: ActionCardProps) {
  const router = useRouter();
  const Icon = iconMap[iconName];

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`flex h-24 w-full items-center gap-4 rounded-[24px] bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99] ${className}`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBackground}`}
      >
        <Icon className="h-5 w-5 text-deep-brown" strokeWidth={2} />
      </span>

      <span className="flex-1 text-left text-base font-bold text-deep-brown">
        {title}
      </span>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-deep-brown"
        strokeWidth={2}
      />
    </button>
  );
}
