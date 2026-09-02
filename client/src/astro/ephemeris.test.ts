import { describe, it, expect } from "vitest";
import { dayNumber, sunLongitude, moonLongitude, planetLongitude, moonIllumination, signOf, PLANET_KEYS } from "./ephemeris";

const d = dayNumber(new Date("2026-08-17T12:00:00Z"));

describe("星盘星历", () => {
  it("2026-08-17 太阳在狮子座(黄经 120–150°)", () => {
    expect(sunLongitude(d)).toBeGreaterThan(120);
    expect(sunLongitude(d)).toBeLessThan(150);
  });
  it("月亮与全部行星黄经都在 0–360", () => {
    expect(moonLongitude(d)).toBeGreaterThanOrEqual(0);
    expect(moonLongitude(d)).toBeLessThan(360);
    for (const k of PLANET_KEYS) {
      const lon = planetLongitude(d, k);
      expect(lon).toBeGreaterThanOrEqual(0);
      expect(lon).toBeLessThan(360);
    }
  });
  it("月相照亮比在 0–1", () => {
    expect(moonIllumination(d)).toBeGreaterThanOrEqual(0);
    expect(moonIllumination(d)).toBeLessThanOrEqual(1);
  });
  it("signOf 分区正确", () => {
    expect(signOf(0)).toBe(0);
    expect(signOf(29.9)).toBe(0);
    expect(signOf(30)).toBe(1);
    expect(signOf(359.9)).toBe(11);
  });
});
