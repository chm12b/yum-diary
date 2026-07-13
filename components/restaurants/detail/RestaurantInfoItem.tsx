import type { LucideIcon } from "lucide-react";

type RestaurantInfoItemProps = {
  icon: LucideIcon;
  title: string;
  value: string;
};

export default function RestaurantInfoItem({
  icon: Icon,
  title,
  value,
}: RestaurantInfoItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 text-center">
      <Icon className="h-5 w-5 text-caramel" strokeWidth={2} />
      <p className="text-xs font-medium text-deep-brown">{title}</p>
      <p className="whitespace-pre-line text-xs leading-relaxed text-cocoa">
        {value}
      </p>
    </div>
  );
}
