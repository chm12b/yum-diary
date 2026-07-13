"use client";

const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

const MINUTES = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

const selectClass =
  "w-7 shrink-0 appearance-none bg-transparent py-0.5 text-center text-[11px] leading-none tabular-nums text-deep-brown focus:outline-none [-webkit-appearance:none]";

type TimePicker24Props = {
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
};

function parseTime(value: string): { hour: string; minute: string } {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return { hour: "", minute: "" };
  }

  const [hour, minute] = value.split(":");
  return { hour, minute };
}

/**
 * Compact 24-hour time picker (HH:mm).
 * Avoids native <input type="time"> locale AM/PM labels that overflow this layout.
 */
export default function TimePicker24({
  value,
  onChange,
  "aria-label": ariaLabel,
}: TimePicker24Props) {
  const { hour, minute } = parseTime(value);

  function commit(nextHour: string, nextMinute: string) {
    if (!nextHour && !nextMinute) {
      onChange("");
      return;
    }

    onChange(`${nextHour || "00"}:${nextMinute || "00"}`);
  }

  return (
    <div className="flex min-w-[4.25rem] flex-1 items-center justify-center gap-px rounded-lg border border-border bg-cream-bg/60 px-1 py-1.5 focus-within:ring-1 focus-within:ring-caramel/40">
      <select
        value={hour}
        aria-label={`${ariaLabel}（時）`}
        onChange={(event) => commit(event.target.value, minute)}
        className={selectClass}
      >
        <option value="">--</option>
        {HOURS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span className="shrink-0 text-[11px] text-cocoa" aria-hidden>
        :
      </span>
      <select
        value={minute}
        aria-label={`${ariaLabel}（分）`}
        onChange={(event) => commit(hour, event.target.value)}
        className={selectClass}
      >
        <option value="">--</option>
        {MINUTES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
