import type { RecordFood } from "@/src/services/record-food";

type OrderedFoodSectionProps = {
  foods: RecordFood[];
};

export default function OrderedFoodSection({ foods }: OrderedFoodSectionProps) {
  if (foods.length === 0) {
    return null;
  }

  return (
    <section className="px-5 pb-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="space-y-2.5 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>
              🍜
            </span>
            <span className="text-sm font-medium text-deep-brown">本次點餐</span>
          </div>
          <ul className="space-y-1.5 pl-1 text-sm leading-relaxed text-deep-brown">
            {foods.map((food) => (
              <li key={food.id} className="flex gap-2">
                <span className="shrink-0 text-caramel">•</span>
                <span>{food.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
