import { describe, expect, it } from "vitest";

import {
  buildFilterChips,
  formatDistanceFilterChipLabel,
} from "./filter-ui";

describe("formatDistanceFilterChipLabel", () => {
  it("formats meters under 1km", () => {
    expect(formatDistanceFilterChipLabel(500)).toBe("📏 500 公尺內");
  });

  it("formats whole kilometers", () => {
    expect(formatDistanceFilterChipLabel(1000)).toBe("📏 1 公里內");
    expect(formatDistanceFilterChipLabel(2000)).toBe("📏 2 公里內");
  });

  it("formats fractional kilometers", () => {
    expect(formatDistanceFilterChipLabel(1500)).toBe("📏 1.5 公里內");
  });
});

describe("buildFilterChips", () => {
  it("shows nearby quick-browse chips", () => {
    expect(
      buildFilterChips({
        maxDistanceMeters: 1000,
        openStatus: "open",
      }),
    ).toEqual([
      { key: "maxDistanceMeters", label: "📏 1 公里內" },
      { key: "openStatus", label: "🟢 營業中" },
    ]);
  });
});
