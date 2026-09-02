import { describe, it, expect } from "vitest";
import { SIGN_CARDS, PLANET_CARDS } from "../astroKnowledge";

describe("占星知识数据(星座/行星)", () => {
  it("十二星座齐全,字段非空", () => {
    expect(SIGN_CARDS.length).toBe(12);
    const names = new Set(SIGN_CARDS.map(s => s.name));
    expect(names.size).toBe(12);
    for (const s of SIGN_CARDS) {
      expect(s.essence.trim()).not.toBe("");
      expect(["火", "土", "风", "水"]).toContain(s.element);
      expect(["创始", "固定", "变动"]).toContain(s.mode);
      expect(s.traits.length).toBeGreaterThan(0);
    }
  });

  it("十大行星齐全,字段非空", () => {
    expect(PLANET_CARDS.length).toBe(10);
    const names = new Set(PLANET_CARDS.map(p => p.name));
    expect(names.size).toBe(10);
    for (const p of PLANET_CARDS) {
      expect(p.glyph.trim()).not.toBe("");
      expect(p.essence.trim()).not.toBe("");
      expect(p.traits.length).toBeGreaterThan(0);
    }
  });
});
