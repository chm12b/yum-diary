import Image from "next/image";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconSrc?: string;
  trailingIconSrc?: string;
  onClick?: () => void;
  className?: string;
};

export default function PrimaryButton({
  title,
  subtitle,
  icon,
  iconSrc,
  trailingIconSrc,
  onClick,
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-auto -mt-2 -mb-2 h-20 w-[300px] rounded-[1.75rem] border border-border bg-sakura-pink px-5 py-3 text-left shadow-pink-button transition-transform active:scale-[0.98] ${className}`}
    >
      <span className="flex items-center gap-3">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={60}
            height={60}
            aria-hidden
            className="h-[60px] w-[60px] shrink-0 object-contain"
          />
        ) : icon ? (
          <span className="shrink-0 text-text-primary">{icon}</span>
        ) : null}
        <span className="min-w-0 flex-1 text-[25px] font-bold leading-tight text-text-primary">
          {title}
        </span>
        {trailingIconSrc ? (
          <Image
            src={trailingIconSrc}
            alt=""
            width={28}
            height={28}
            aria-hidden
            className="h-7 w-7 shrink-0 object-contain"
          />
        ) : null}
      </span>
      {subtitle ? (
        <span className="mt-3 block pl-[4.5rem] text-sm text-text-secondary">
          {subtitle}
        </span>
      ) : null}
    </button>
  );
}
