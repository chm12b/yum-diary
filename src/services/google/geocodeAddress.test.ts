import { describe, expect, it } from "vitest";

import { isGeocodeAddressMatch } from "./geocodeAddress";

describe("isGeocodeAddressMatch", () => {
  it("accepts same city and district", () => {
    expect(
      isGeocodeAddressMatch(
        "台南市安定區慈安宮廟口",
        "台南市安定區安定258號",
      ),
    ).toBe(true);
  });

  it("accepts city-only input when candidate city matches", () => {
    expect(
      isGeocodeAddressMatch("台南市民族路100號", "台南市中西區民族路100號"),
    ).toBe(true);
  });

  it("rejects different cities", () => {
    expect(
      isGeocodeAddressMatch(
        "台南市安定區慈安宮廟口",
        "台北市信義區松高路11號",
      ),
    ).toBe(false);
  });

  it("rejects when input district differs", () => {
    expect(
      isGeocodeAddressMatch(
        "台南市安定區慈安宮廟口",
        "台南市中西區府前路一段100號",
      ),
    ).toBe(false);
  });

  it("rejects when city cannot be parsed from input", () => {
    expect(
      isGeocodeAddressMatch("民族路100號", "台南市中西區民族路100號"),
    ).toBe(false);
  });

  it("rejects when city cannot be parsed from candidate", () => {
    expect(
      isGeocodeAddressMatch("台南市安定區慈安宮廟口", "慈安宮廟口"),
    ).toBe(false);
  });
});
