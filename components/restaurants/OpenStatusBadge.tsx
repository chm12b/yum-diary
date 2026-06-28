import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type OpenStatusBadgeProps = {
  isOpen: boolean;
  className?: string;
};

export default function OpenStatusBadge({
  isOpen,
  className = "",
}: OpenStatusBadgeProps) {
  return (
    <Image
      src={isOpen ? homeAssets.restaurantOpen : homeAssets.restaurantClose}
      alt={isOpen ? "營業中" : "已打烊"}
      width={72}
      height={32}
      className={`mt-0 mb-[5px] h-[50px] w-[80px] object-contain ${className}`}
    />
  );
}
