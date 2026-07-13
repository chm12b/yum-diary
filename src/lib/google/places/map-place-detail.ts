import type {
  BusinessHours,
  BusinessHoursPeriod,
  GoogleOpeningHoursPeriod,
  GooglePlace,
  GoogleRegularOpeningHours,
  PlaceDetailItem,
  WeeklyHoursRow,
} from "./types";

/** Google day index → short form label (0 = Sunday). */
const GOOGLE_DAY_SHORT = ["日", "一", "二", "三", "四", "五", "六"] as const;

/** Display order Mon → Sun for the special-hours sheet. */
const WEEKLY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const GOOGLE_DAY_FULL: Record<number, string> = {
  0: "星期日",
  1: "星期一",
  2: "星期二",
  3: "星期三",
  4: "星期四",
  5: "星期五",
  6: "星期六",
};

const MAX_PERIODS = 5;

type DayRange = { start: string; end: string };

export type OpeningHoursMapping = {
  businessHours: BusinessHours;
  specialHours: boolean;
  weeklyHours: WeeklyHoursRow[];
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTime(hour = 0, minute = 0): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** Normalize for HTML time inputs (max 23:59). */
function toPickerTime(value: string): string {
  if (value === "24:00") {
    return "23:59";
  }
  return value;
}

function rangeKey(range: DayRange): string {
  return `${range.start}~${range.end}`;
}

function daySignature(ranges: DayRange[]): string {
  if (ranges.length === 0) {
    return "CLOSED";
  }

  return ranges.map(rangeKey).join("|");
}

function isAlwaysOpen(hours: GoogleRegularOpeningHours): boolean {
  const periods = hours.periods ?? [];
  if (periods.length !== 1) {
    return false;
  }

  const [period] = periods;
  return (
    period.open?.day === 0 &&
    (period.open.hour ?? 0) === 0 &&
    (period.open.minute ?? 0) === 0 &&
    period.close == null
  );
}

function buildDayRanges(
  periods: GoogleOpeningHoursPeriod[],
): Map<number, DayRange[]> {
  const byDay = new Map<number, DayRange[]>();

  for (let day = 0; day <= 6; day += 1) {
    byDay.set(day, []);
  }

  for (const period of periods) {
    if (typeof period.open?.day !== "number") {
      continue;
    }

    const start = formatTime(period.open.hour, period.open.minute);
    const end = period.close
      ? formatTime(period.close.hour, period.close.minute)
      : "24:00";
    const ranges = byDay.get(period.open.day) ?? [];
    ranges.push({ start, end });
    byDay.set(period.open.day, ranges);
  }

  for (const [day, ranges] of byDay) {
    ranges.sort((a, b) => a.start.localeCompare(b.start));
    byDay.set(day, ranges);
  }

  return byDay;
}

/**
 * Among open days, pick the schedule that appears most often,
 * then turn each range into a business-hours period (max 5).
 */
function findMostCommonDayPeriods(
  byDay: Map<number, DayRange[]>,
): BusinessHoursPeriod[] {
  const signatureCounts = new Map<string, { count: number; ranges: DayRange[] }>();

  for (let day = 0; day <= 6; day += 1) {
    const ranges = byDay.get(day) ?? [];
    if (ranges.length === 0) {
      continue;
    }

    const signature = daySignature(ranges);
    const existing = signatureCounts.get(signature);
    if (existing) {
      existing.count += 1;
    } else {
      signatureCounts.set(signature, { count: 1, ranges });
    }
  }

  let best: { count: number; ranges: DayRange[] } | null = null;

  for (const entry of signatureCounts.values()) {
    if (!best || entry.count > best.count) {
      best = entry;
    }
  }

  if (!best) {
    return [];
  }

  return best.ranges.slice(0, MAX_PERIODS).map((range) => ({
    open: toPickerTime(range.start),
    close: toPickerTime(range.end),
  }));
}

function buildWeeklyHours(byDay: Map<number, DayRange[]>): WeeklyHoursRow[] {
  return WEEKLY_DISPLAY_ORDER.map((day) => {
    const ranges = byDay.get(day) ?? [];
    return {
      dayLabel: GOOGLE_DAY_FULL[day],
      hoursLabel:
        ranges.length === 0
          ? "休息"
          : ranges.map((range) => rangeKey(range)).join("、"),
    };
  });
}

function buildClosedDays(byDay: Map<number, DayRange[]>): string[] {
  const closedDays: string[] = [];

  for (let day = 0; day <= 6; day += 1) {
    if ((byDay.get(day) ?? []).length === 0) {
      closedDays.push(GOOGLE_DAY_SHORT[day]);
    }
  }

  return closedDays;
}

function hasVaryingOpenDayHours(byDay: Map<number, DayRange[]>): boolean {
  const openSignatures = new Set<string>();

  for (let day = 0; day <= 6; day += 1) {
    const ranges = byDay.get(day) ?? [];
    if (ranges.length === 0) {
      continue;
    }
    openSignatures.add(daySignature(ranges));
  }

  return openSignatures.size > 1;
}

/**
 * Maps Google regularOpeningHours → business_hours periods
 * (most-common day schedule) plus UI-only special/weekly metadata.
 */
export function mapRegularOpeningHours(
  hours: GoogleRegularOpeningHours | undefined,
): OpeningHoursMapping | null {
  if (!hours) {
    return null;
  }

  if (isAlwaysOpen(hours)) {
    return {
      businessHours: {
        periods: [{ open: "00:00", close: "23:59" }],
        closedDays: [],
        openAllYear: true,
        irregularHolidays: false,
      },
      specialHours: false,
      weeklyHours: WEEKLY_DISPLAY_ORDER.map((day) => ({
        dayLabel: GOOGLE_DAY_FULL[day],
        hoursLabel: "00:00~24:00",
      })),
    };
  }

  const periods = hours.periods ?? [];
  if (periods.length === 0) {
    return null;
  }

  const byDay = buildDayRanges(periods);
  const mappedPeriods = findMostCommonDayPeriods(byDay);
  if (mappedPeriods.length === 0) {
    return null;
  }

  const closedDays = buildClosedDays(byDay);

  return {
    businessHours: {
      periods: mappedPeriods,
      closedDays,
      openAllYear: closedDays.length === 0,
      irregularHolidays: false,
    },
    specialHours: hasVaryingOpenDayHours(byDay),
    weeklyHours: buildWeeklyHours(byDay),
  };
}

export function mapGooglePlaceToDetailItem(
  place: GooglePlace,
): PlaceDetailItem | null {
  if (!place.id) {
    return null;
  }

  const mapped = mapRegularOpeningHours(place.regularOpeningHours);

  return {
    id: place.id,
    name: place.displayName?.text?.trim() || "",
    address: place.formattedAddress?.trim() || "",
    phone: place.nationalPhoneNumber?.trim() || null,
    website: place.websiteUri?.trim() || null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    category: place.primaryType ?? null,
    businessHours: mapped?.businessHours ?? null,
    specialHours: mapped?.specialHours ?? false,
    weeklyHours: mapped?.weeklyHours ?? null,
    photo: place.photos?.[0]?.name ?? null,
  };
}

export function normalizePlaceId(placeId: string): string {
  const trimmed = placeId.trim();
  return trimmed.startsWith("places/")
    ? trimmed.slice("places/".length)
    : trimmed;
}
