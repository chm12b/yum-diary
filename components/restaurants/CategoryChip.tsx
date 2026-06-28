type CategoryChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function CategoryChip({
  label,
  active,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-caramel bg-sakura-pink text-deep-brown"
          : "border-border bg-rice-white text-cocoa"
      }`}
    >
      {label}
    </button>
  );
}
