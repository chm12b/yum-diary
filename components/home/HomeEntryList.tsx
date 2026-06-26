import EntryCard from "@/components/ui/EntryCard";

type HomeEntryItem = {
  id: string;
  label: string;
  emoji: string;
  href: string;
};

const homeEntries: HomeEntryItem[] = [
  {
    id: "nearby",
    label: "逛逛附近美食",
    emoji: "🍜",
    href: "/restaurants",
  },
  {
    id: "frequent",
    label: "常吃餐廳",
    emoji: "❤️",
    href: "/favorites",
  },
];

export default function HomeEntryList() {
  return (
    <section className="flex flex-col gap-4 px-5 pt-4">
      {homeEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          href={entry.href}
          label={entry.label}
          leading={
            <span aria-hidden className="leading-none">
              {entry.emoji}
            </span>
          }
        />
      ))}
    </section>
  );
}
