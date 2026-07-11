import { describe, expect, it } from "vitest";

import { getReadableTextColor } from "./type-colors";

describe("type-colors: getReadableTextColor", () => {
  it("picks dark text for light backgrounds", () => {
    expect(getReadableTextColor("#fbd100")).toBe("#14151a");
    expect(getReadableTextColor("#9ad6df")).toBe("#14151a");
  });

  it("picks white text for dark backgrounds", () => {
    expect(getReadableTextColor("#75574c")).toBe("#ffffff");
    expect(getReadableTextColor("#7037ff")).toBe("#ffffff");
  });
});
