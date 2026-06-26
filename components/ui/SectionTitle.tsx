import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`text-sm font-semibold tracking-wide text-cocoa ${className}`}
    >
      {children}
    </h2>
  );
}
