import { describe, it, expect } from "vitest";
import { SYMBOL_TYPES } from "../symbols";
import tarot from "../../data/cards.tarot.json";
import moonology from "../../data/cards.moonology.json";

const symbolSet = new Set<string>(SYMBOL_TYPES);

describe("塔罗牌库数据", () => {
  it("牌库 78 张齐全(22 大牌 + 56 小牌)", () => {
    expect(tarot.cards).toHaveLength(78);
    expect(tarot.cards.filter(c => c.arcana === "major")).toHaveLength(22);
    expect(tarot.cards.filter(c => c.arcana === "minor")).toHaveLength(56);
  });
  it("id 全局唯一", () => {
    const ids = tarot.cards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("每张牌字段完整且合法", () => {
    for (const c of tarot.cards) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.keywords.length).toBeGreaterThanOrEqual(3);
      expect(c.keywords.length).toBeLessThanOrEqual(5);
      expect(c.upright.length).toBeGreaterThanOrEqual(30);
      expect(c.domains.general.length).toBeGreaterThanOrEqual(30);
      expect(c.detail.length).toBeGreaterThanOrEqual(80);
      expect(c.detail.length).toBeLessThanOrEqual(260);
      expect(c.palette.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(c.palette.fg).toMatch(/^#[0-9a-f]{6}$/i);
      for (const s of c.symbols) {
        expect(symbolSet.has(s.type)).toBe(true);
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(100);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(100);
      }
      if (c.arcana === "oracle") expect(c.reversed).toBeNull();
    }
  });
});

describe("符号类型一致性", () => {
  it("两份牌库用到的符号类型均为 SYMBOL_TYPES 中的非空字符串", () => {
    const used = new Set<string>();
    for (const c of [...tarot.cards, ...moonology.cards]) {
      for (const s of c.symbols) used.add(s.type);
    }
    expect(used.size).toBeGreaterThan(0);
    for (const t of used) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
      expect(symbolSet.has(t)).toBe(true);
    }
  });
});

describe("月相神谕卡数据包", () => {
  it("不少于 30 张,全部无逆位", () => {
    expect(moonology.cards.length).toBeGreaterThanOrEqual(30);
    for (const c of moonology.cards) {
      expect(c.arcana).toBe("oracle");
      expect(c.reversed).toBeNull();
    }
  });
  it("牌组元信息与字段合法", () => {
    expect(moonology.id).toBe("moonology");
    expect(moonology.type).toBe("oracle");
    const ids = moonology.cards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of moonology.cards) {
      expect(c.number).toBeGreaterThanOrEqual(1);
      expect(c.suit).toBeNull();
      expect(c.keywords.length).toBeGreaterThanOrEqual(3);
      expect(c.keywords.length).toBeLessThanOrEqual(5);
      expect(c.upright.length).toBeGreaterThanOrEqual(40);
      expect(c.upright.length).toBeLessThanOrEqual(80);
      expect(c.domains.general.length).toBeGreaterThanOrEqual(40);
      expect(c.symbols.length).toBeGreaterThanOrEqual(2);
      expect(c.symbols.length).toBeLessThanOrEqual(3);
      for (const s of c.symbols) {
        expect(symbolSet.has(s.type)).toBe(true);
      }
      expect(c.palette.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(c.palette.fg).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
