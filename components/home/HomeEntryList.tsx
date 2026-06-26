import Link from "next/link";

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
    <section className="flex flex-col gap-3 px-5 pt-3">
      {homeEntries.map((entry) => (
        <Link
          key={entry.id}
          href={entry.href}
          className="flex items-center gap-3 rounded-2xl bg-rice-white px-4 py-4"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {entry.emoji}
          </span>
          <span className="text-base font-medium text-deep-brown">
            {entry.label}
          </span>
        </Link>
      ))}
    </section>
  );
}
