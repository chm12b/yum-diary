import EntryCard from "@/components/ui/EntryCard";
import { homeAssets } from "@/src/lib/home-assets";

const homeEntries = [
  {
    id: "nearby",
    label: "逛逛附近美食",
    subtitle: "發現附近的美味餐廳",
    iconSrc: homeAssets.iconNearbyFood,
    href: "/restaurants",
  },
  {
    id: "frequent",
    label: "常吃餐廳",
    subtitle: "看看你最常回訪的店家",
    iconSrc: homeAssets.iconFrequentRestaurants,
    href: "/favorites",
  },
] as const;

export default function HomeEntryList() {
  return (
    <section className="flex flex-col gap-4 px-5 pt-10">
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
