import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type RestaurantInfoItemProps = {
  icon: LucideIcon;
  title: string;
  titleAction?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function RestaurantInfoItem({
  icon: Icon,
  title,
  titleAction,
  children,
  className = "",
}: RestaurantInfoItemProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
        <p className="min-w-0 flex-1 text-xs font-medium text-deep-brown">
          {title}
        </p>
        {titleAction ? (
          <div className="shrink-0">{titleAction}</div>
        ) : null}
      </div>
      <div className="mt-1.5 text-xs leading-relaxed break-words text-cocoa">
        {children}
      </div>
    </div>
  );
}
