import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type RestaurantInfoItemProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
};

export default function RestaurantInfoItem({
  icon: Icon,
  title,
  children,
  className = "",
}: RestaurantInfoItemProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 shrink-0 text-caramel" strokeWidth={2} />
        <p className="text-xs font-medium text-deep-brown">{title}</p>
      </div>
      <div className="mt-1.5 text-xs leading-relaxed break-words text-cocoa">
        {children}
      </div>
    </div>
  );
}
