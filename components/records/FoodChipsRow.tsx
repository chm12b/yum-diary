import FoodChip from "@/components/shared/FoodChip";

const MAX_VISIBLE = 3;

type FoodChipsRowProps = {
  foods: string[];
};

export default function FoodChipsRow({ foods }: FoodChipsRowProps) {
  if (foods.length === 0) {
    return null;
  }

  const visible = foods.slice(0, MAX_VISIBLE);
  const moreCount = foods.length - MAX_VISIBLE;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((name, index) => (
        <FoodChip key={`${name}-${index}`} label={name} />
      ))}
      {moreCount > 0 ? (
        <span className="inline-flex h-6 items-center px-0.5 text-[11px] font-medium text-text-secondary">
          +{moreCount} 更多
        </span>
      ) : null}
    </div>
  );
}
