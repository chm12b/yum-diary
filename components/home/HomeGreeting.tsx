"use client";

import { useEffect, useState } from "react";

import { getGreeting } from "@/src/lib/greeting";
import { getMyDisplayName } from "@/src/services/profile/profile.service";

function composeGreetingLine(displayName: string | null): string {
  const { text, emoji } = getGreeting();

  if (displayName) {
    return `${text}，${displayName} ${emoji}`;
  }

  return `${text} ${emoji}`;
}

export default function HomeGreeting() {
  const [greetingLine, setGreetingLine] = useState(() =>
    composeGreetingLine(null),
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const displayName = await getMyDisplayName();
        if (!cancelled) {
          setGreetingLine(composeGreetingLine(displayName));
        }
      } catch {
        if (!cancelled) {
          setGreetingLine(composeGreetingLine(null));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="px-5 pt-1 pb-2">
      <p className="-mt-[10px] font-display text-sm font-medium text-text-secondary">
        {greetingLine}
      </p>
      <h2 className="mt-0 -mb-5 font-display text-[1.75rem] font-bold leading-tight text-text-primary">
        今天想吃什麼呢？
      </h2>
    </section>
  );
}
