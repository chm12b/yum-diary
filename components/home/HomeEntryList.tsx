import EntryCard from "@/components/ui/EntryCard";
import { homeAssets } from "@/src/lib/home-assets";

const homeEntries = [
  {
    id: "nearby",
    label: "🔍 探索附近餐廳",
    subtitle: "探索附近的美味餐廳",
    iconSrc: homeAssets.iconNearbyFood,
    href: "/restaurants/nearby",
  },
  {
    id: "frequent",
    label: "🍜 常吃餐廳",
    subtitle: "看看你最常回訪的店家",
    iconSrc: homeAssets.iconFrequentRestaurants,
    href: "/restaurants/frequent",
  },
] as const;

export default function HomeEntryList() {
  return (
    <section className="-mt-[40px] flex flex-col gap-4 px-5 pt-[50px]">
      {homeEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          href={entry.href}
          label={entry.label}
          subtitle={entry.subtitle}
          iconSrc={entry.iconSrc}
        />
      ))}
    </section>
  );
}
