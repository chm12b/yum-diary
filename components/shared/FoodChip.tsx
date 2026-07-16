type FoodChipSize = "sm" | "md";

type FoodChipProps = {
  label: string;
  size?: FoodChipSize;
  className?: string;
};

const SIZE_CLASS: Record<FoodChipSize, string> = {
  sm: "h-6 px-2.5 text-[11px]",
  md: "h-7 px-3 text-xs",
};

/**
 * Handwritten-style text capsule for ordered foods, tags, categories, etc.
 */
export default function FoodChip({
  label,
  size = "sm",
  className = "",
}: FoodChipProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border border-border/70 bg-cream-bg font-medium text-deep-brown ${SIZE_CLASS[size]} ${className}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
