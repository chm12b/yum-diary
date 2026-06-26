import { Dices } from "lucide-react";
import Image from "next/image";

import BunnyMessage from "@/components/home/BunnyMessage";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function BunnyHero() {
  return (
    <section className="flex flex-col items-center gap-3 px-5 pt-3">
      <div className="relative h-32 w-32">
        <Image
          src="/bunny/bunny.svg"
          alt="兔兔吉祥物"
          fill
          className="object-contain"
          priority
        />
      </div>
      <BunnyMessage />
      <div className="w-full pt-1">
        <PrimaryButton
          title="幫我決定"
          subtitle="讓兔兔幫你挑選吧～"
          icon={<Dices className="h-7 w-7" strokeWidth={2} />}
        />
      </div>
    </section>
  );
}
