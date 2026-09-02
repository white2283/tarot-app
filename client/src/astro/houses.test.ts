import { describe, it, expect } from "vitest";
import { localSiderealDegrees, ascendant, midheaven, houseOf, houseCusp, angles } from "./houses";

describe("宫位计算", () => {
  it("2000-01-01 12:00 UTC 格林尼治恒星时 ≈ 280.46°", () => {
    const lst = localSiderealDegrees(new Date("2000-01-01T12:00:00Z"), 0);
    expect(lst).toBeGreaterThan(279);
    expect(lst).toBeLessThan(282);
  });
  it("2000-01-01 12:00 UTC 伦敦(51.5N) 上升 ≈ 白羊 24°(公开星历表对照)", () => {
    const ramc = localSiderealDegrees(new Date("2000-01-01T12:00:00Z"), 0);
    const asc = ascendant(ramc, 51.5);
    expect(asc).toBeGreaterThan(18);
    expect(asc).toBeLessThan(30);
  });
  it("MC 与 ASC 都在 0–360", () => {
    const { asc, mc } = angles(new Date("1995-06-15T08:30:00Z"), 39.9, 116.4);
    expect(asc).toBeGreaterThanOrEqual(0);
    expect(asc).toBeLessThan(360);
    expect(mc).toBeGreaterThanOrEqual(0);
    expect(mc).toBeLessThan(360);
  });
  it("等宫制(默认):第 1 宫从上升点起算,每宫 30°", () => {
    // 上升金牛 15°(黄经 45°),行星金牛 15°(45°) → 第 1 宫
    expect(houseOf(45, 45)).toBe(1);
    // 行星双子 0°(60°)= 上升后 15° → 第 1 宫;双子 15°(75°)= 上升后 30° → 第 2 宫
    expect(houseOf(60, 45)).toBe(1);
    expect(houseOf(75, 45)).toBe(2);
    // 行星白羊 15°(15°)= 上升前 30° → 第 12 宫
    expect(houseOf(15, 45)).toBe(12);
    // 宫头:第 2 宫 = 上升 + 30°
    expect(houseCusp(2, 45)).toBe(75);
    expect(houseCusp(2, 45, "whole")).toBe(60); // 整宫制下第 2 宫头 = 金牛下一星座起点(双子 0°)
  });
  it("整宫制宫位:与上升同宫为 1,下一宫为 2,循环", () => {
    expect(houseOf(45, 30, "whole")).toBe(1);   // 上升金牛 0°,行星金牛 15°
    expect(houseOf(75, 30, "whole")).toBe(2);   // 行星双子 15°
    expect(houseOf(15, 30, "whole")).toBe(12);  // 行星白羊 15°(上升前一宫)
  });
});
