import Image from "next/image";

import DecideButton from "@/components/home/DecideButton";

export default function BunnyHero() {
  return (
    <section className="flex flex-col items-center gap-5 px-5 pt-4">
      <div className="relative h-44 w-44">
        <Image
          src="/bunny/placeholder.svg"
          alt="兔兔吉祥物"
          fill
          className="object-contain"
          priority
        />
      </div>
      <DecideButton />
    </section>
  );
}
