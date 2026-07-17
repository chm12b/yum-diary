export type GreetingParts = {
  text: string;
  emoji: string;
};

/**
 * Time-based greeting for the home Hero.
 * Uses the local clock of `now` (defaults to current time).
 *
 * 05:00–10:59  早安 ❤️
 * 11:00–16:59  午安 ☀️
 * 17:00–22:59  晚安 🌙
 * 23:00–04:59  夜深了 ✨
 */
export function getGreeting(now: Date = new Date()): GreetingParts {
  const hour = now.getHours();

  if (hour >= 5 && hour < 11) {
    return { text: "早安", emoji: "❤️" };
  }

  if (hour >= 11 && hour < 17) {
    return { text: "午安", emoji: "☀️" };
  }

  if (hour >= 17 && hour < 23) {
    return { text: "晚安", emoji: "🌙" };
  }

  return { text: "夜深了", emoji: "✨" };
}
