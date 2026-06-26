import type { ReactNode } from "react";

type PrimaryButtonProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function PrimaryButton({
  title,
  subtitle,
  icon,
  onClick,
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-full border border-khaki/80 bg-khaki px-6 py-4 text-left shadow-button ${className}`}
    >
      {icon ? <span className="shrink-0 text-deep-brown">{icon}</span> : null}
      <span className="flex flex-col gap-0.5">
        <span className="text-lg font-bold leading-tight text-deep-brown">
          {title}
        </span>
        {subtitle ? (
          <span className="text-sm font-normal text-cocoa">{subtitle}</span>
        ) : null}
      </span>
    </button>
  );
}
