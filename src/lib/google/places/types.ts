/** Frontend-facing place shape returned by Places search. */
export type PlaceSearchItem = {
  id: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviewCount: number | null;
};

/** Matches restaurants.business_hours jsonb + Add Restaurant form state. */
export type BusinessHoursPeriod = {
  /** HH:mm, or "" when unset. */
  open: string;
  /** HH:mm, or "" when unset. */
  close: string;
};

export type BusinessHours = {
  periods: BusinessHoursPeriod[];
  closedDays: string[];
  openAllYear: boolean;
  irregularHolidays: boolean;
};

/** Form-only row id for React keys (not persisted). */
export type BusinessHoursPeriodRow = BusinessHoursPeriod & {
  id: string;
};

/** Full weekly schedule for special-hours UI (not stored in business_hours). */
export type WeeklyHoursRow = {
  dayLabel: string;
  hoursLabel: string;
};

/** Frontend-facing place shape returned by Place Details. */
export type PlaceDetailItem = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  businessHours: BusinessHours | null;
  /** True when open days do not all share the same hours. */
  specialHours: boolean;
  /** Google weekly breakdown for the ⚠️ sheet (UI only). */
  weeklyHours: WeeklyHoursRow[] | null;
  /** Google photo resource name only — download/Storage comes later. */
  photo: string | null;
};

export type GooglePlacePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
};

export type GoogleOpeningHoursPeriodPoint = {
  day?: number;
  hour?: number;
  minute?: number;
};

export type GoogleOpeningHoursPeriod = {
  open?: GoogleOpeningHoursPeriodPoint;
  close?: GoogleOpeningHoursPeriodPoint;
};

export type GoogleRegularOpeningHours = {
  periods?: GoogleOpeningHoursPeriod[];
  weekdayDescriptions?: string[];
  openNow?: boolean;
};

/** Raw place object from Places API (New). */
export type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  primaryType?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: GoogleRegularOpeningHours;
  photos?: GooglePlacePhoto[];
};

export type GoogleApiErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export type GoogleSearchTextResponse = GoogleApiErrorPayload & {
  places?: GooglePlace[];
};

export type GooglePlaceDetailsResponse = GoogleApiErrorPayload & GooglePlace;

/** Unified API envelope used by Places route handlers. */
export type PlacesApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };
