import type { ReactNode } from "react";

type PaperCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PaperCard({ children, className = "" }: PaperCardProps) {
  return (
    <div
      className={`rounded-3xl border border-border bg-rice-white ${className}`}
    >
      {children}
    </div>
  );
}
