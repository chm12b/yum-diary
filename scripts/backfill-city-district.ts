/**
 * One-off backfill: parse restaurants.address → city / district.
 *
 * Usage:
 *   npm run backfill:city-district
 *
 * Requires in `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Safe to re-run: skips rows whose city/district are already correct.
 * Never overwrites existing valid city/district with parser null/null.
 */

import { createClient } from "@supabase/supabase-js";

import { resolveCityDistrict } from "../src/services/restaurant/resolveCityDistrict";
import type { Database } from "../src/types/database";

type RestaurantRow = Pick<
  Database["public"]["Tables"]["restaurants"]["Row"],
  "id" | "name" | "address" | "city" | "district"
>;

type FailedRow = {
  name: string;
  address: string | null;
  reason: string;
};

type WarningRow = {
  name: string;
  address: string | null;
  existingCity: string | null;
  existingDistrict: string | null;
};

function sameNullable(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return (a ?? null) === (b ?? null);
}

function hasValidLocation(
  city: string | null | undefined,
  district: string | null | undefined,
): boolean {
  return Boolean(city?.trim() || district?.trim());
}

function isEmptyParse(city: string | null, district: string | null): boolean {
  return city == null && district == null;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  // Service role bypasses RLS so we can backfill every restaurant once.
  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, address, city, district")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const restaurants = (data ?? []) as RestaurantRow[];
  let updated = 0;
  let skipped = 0;
  const failed: FailedRow[] = [];
  const warnings: WarningRow[] = [];

  for (const restaurant of restaurants) {
    const next = resolveCityDistrict(restaurant.address);
    const cityUnchanged = sameNullable(restaurant.city, next.city);
    const districtUnchanged = sameNullable(restaurant.district, next.district);

    if (cityUnchanged && districtUnchanged) {
      skipped += 1;
      continue;
    }

    // Parser failed — never wipe existing valid location data.
    if (
      isEmptyParse(next.city, next.district) &&
      hasValidLocation(restaurant.city, restaurant.district)
    ) {
      skipped += 1;
      warnings.push({
        name: restaurant.name,
        address: restaurant.address,
        existingCity: restaurant.city,
        existingDistrict: restaurant.district,
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        city: next.city,
        district: next.district,
      })
      .eq("id", restaurant.id);

    if (updateError) {
      failed.push({
        name: restaurant.name,
        address: restaurant.address,
        reason: updateError.message,
      });
      continue;
    }

    updated += 1;
  }

  console.log("");
  console.log("================================");
  console.log("Restaurant Backfill Summary");
  console.log("");
  console.log(`Total: ${restaurants.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed.length}`);
  console.log("================================");

  if (warnings.length > 0) {
    console.log("");
    console.log("Warnings (parser null/null; kept existing location):");
    for (const row of warnings) {
      console.log(`- ${row.name}`);
      console.log(`  Existing City: ${row.existingCity ?? "(null)"}`);
      console.log(`  Existing District: ${row.existingDistrict ?? "(null)"}`);
      console.log(`  Address: ${row.address ?? "(null)"}`);
    }
  }

  if (failed.length > 0) {
    console.log("");
    console.log("Failed restaurants:");
    for (const row of failed) {
      console.log(`- ${row.name}`);
      console.log(`  Address: ${row.address ?? "(null)"}`);
      console.log(`  Reason: ${row.reason}`);
    }
  }

  console.log("");

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Backfill failed:", message);
  process.exitCode = 1;
});
