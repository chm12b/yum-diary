import { EMPTY_ADDRESS_INFO, type AddressInfo } from "./types";

/**
 * Taiwan cities / counties (normalized 臺 → 台).
 * Longer names first so matching stays unambiguous.
 */
const TAIWAN_CITIES: readonly string[] = [
  "新北市",
  "台北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

/** District / township suffix after a known city. */
const DISTRICT_PATTERN = /^([\u4e00-\u9fff]{1,4}[區鄉鎮市])/;

function normalizeTaiwanText(value: string): string {
  return value
    .replace(/臺/g, "台")
    .replace(/[\s\u3000]+/g, "")
    .trim();
}

/**
 * Strip common leading noise: country label, postal code.
 */
function stripLeadingNoise(value: string): string {
  return value
    .replace(/^(中華民國|台灣|台湾|Taiwan)/i, "")
    .replace(/^\d{3,6}/, "");
}

function findTaiwanCity(
  normalized: string,
): { city: string; index: number } | null {
  let best: { city: string; index: number } | null = null;

  for (const city of TAIWAN_CITIES) {
    const index = normalized.indexOf(city);
    if (index === -1) {
      continue;
    }
    if (
      best == null ||
      index < best.index ||
      (index === best.index && city.length > best.city.length)
    ) {
      best = { city, index };
    }
  }

  return best;
}

function parseDistrict(afterCity: string): string | null {
  const match = afterCity.match(DISTRICT_PATTERN);
  if (!match) {
    return null;
  }

  const district = match[1];
  // Guard against swallowing road names (e.g. 文化路一段).
  if (/[路街巷弄段號]/.test(district)) {
    return null;
  }

  return district;
}

/**
 * Parse an address into city / district.
 *
 * Currently supports Taiwan addresses only.
 * Always returns AddressInfo — never throws.
 * Pure function: no I/O, Supabase, or browser APIs.
 */
export function parseAddress(address: string): AddressInfo {
  if (typeof address !== "string") {
    return { ...EMPTY_ADDRESS_INFO };
  }

  const trimmed = address.trim();
  if (!trimmed) {
    return { ...EMPTY_ADDRESS_INFO };
  }

  const normalized = stripLeadingNoise(normalizeTaiwanText(trimmed));
  if (!normalized) {
    return { ...EMPTY_ADDRESS_INFO };
  }

  const found = findTaiwanCity(normalized);
  if (!found) {
    return { ...EMPTY_ADDRESS_INFO };
  }

  const afterCity = normalized.slice(found.index + found.city.length);
  const district = parseDistrict(afterCity);

  return {
    city: found.city,
    district,
  };
}
