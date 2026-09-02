import { describe, it, expect } from "vitest";
import { SPREADS, getSpread } from "../spreads";
import { SPREAD_LAYOUTS } from "../layouts";

describe("牌阵布局", () => {
  it("7 个牌阵每个布局数量与 cardCount 一致", () => {
    expect(SPREADS).toHaveLength(7);
    for (const s of SPREADS) {
      expect(SPREAD_LAYOUTS[s.id].length).toBe(getSpread(s.id)!.cardCount);
    }
  });
});
