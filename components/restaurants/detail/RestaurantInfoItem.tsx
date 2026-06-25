import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type RestaurantInfoItemProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export default function RestaurantInfoItem({
  icon: Icon,
  title,
  value,
  subtitle,
  trailing,
}: RestaurantInfoItemProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-caramel" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-deep-brown">{title}</p>
        <p className="mt-1 whitespace-pre-line text-sm text-cocoa">{value}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-cocoa/80">{subtitle}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0 self-center">{trailing}</div> : null}
    </div>
  );
}
