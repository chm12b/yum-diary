import EntryCard from "@/components/ui/EntryCard";
import { homeAssets } from "@/src/lib/home-assets";
import { NEARBY_QUICK_BROWSE_QUERY } from "@/src/lib/restaurants/nearby-quick-browse";

const homeEntries = [
  {
    id: "nearby",
    label: "逛逛附近餐廳",
    subtitle: "看看附近正在營業的店家",
    iconSrc: homeAssets.iconNearbyRestaurant,
    href: `/restaurants?${NEARBY_QUICK_BROWSE_QUERY}=1`,
  },
  {
    id: "frequent",
    label: "常吃餐廳",
    subtitle: "看看你最常回訪的店家",
    iconSrc: homeAssets.iconFrequentRestaurants,
    href: "/restaurants/frequent",
  },
] as const;

export default function HomeEntryList() {
  return (
    <section className="mt-4 flex flex-col gap-4 px-5">
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
