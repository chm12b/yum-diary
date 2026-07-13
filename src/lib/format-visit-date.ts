export function formatVisitDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const w = weekdays[date.getDay()];

  return `${y} / ${m} / ${d} (${w})`;
}
