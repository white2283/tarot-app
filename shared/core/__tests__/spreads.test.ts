import { describe, it, expect } from "vitest";
import { SPREADS, getSpread } from "../spreads";

describe("牌阵数据", () => {
  it("共 7 个牌阵", () => {
    expect(SPREADS).toHaveLength(7);
  });
  it("id 全局唯一", () => {
    expect(new Set(SPREADS.map(s => s.id)).size).toBe(7);
  });
  it("每个牌阵 cardCount 与 positions 长度一致", () => {
    for (const s of SPREADS) expect(s.cardCount).toBe(s.positions.length);
  });
  it("getSpread 按 id 查找", () => {
    expect(getSpread("celtic-cross")?.cardCount).toBe(10);
    expect(getSpread("nonexistent")).toBeUndefined();
  });
});
