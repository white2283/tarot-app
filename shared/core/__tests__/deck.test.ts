import { describe, it, expect } from "vitest";
import { createDeck, shuffle, draw } from "../deck";
import type { DeckData, CardData } from "../types";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fakeCard(id: string, arcana: CardData["arcana"] = "minor"): CardData {
  return {
    id, name: id, nameEn: id, arcana, number: 1, suit: "wands",
    keywords: ["a", "b", "c"], upright: "正", reversed: "逆",
    domains: { general: "通用" }, symbols: [], palette: { bg: "#000", fg: "#fff" }
  };
}

const tarotData: DeckData = {
  id: "tarot", name: "韦特塔罗", type: "tarot",
  cards: Array.from({ length: 78 }, (_, i) => fakeCard(`c${i}`))
};
const oracleData: DeckData = {
  id: "moon", name: "月相", type: "oracle",
  cards: Array.from({ length: 44 }, (_, i) => fakeCard(`o${i}`, "oracle"))
};

describe("deck 引擎", () => {
  it("createDeck 返回全部牌", () => {
    expect(createDeck(tarotData)).toHaveLength(78);
  });
  it("shuffle 不增不减成员", () => {
    const deck = createDeck(tarotData);
    const s = shuffle(deck, mulberry32(42));
    expect(s).toHaveLength(78);
    expect(new Set(s.map(c => c.id))).toEqual(new Set(deck.map(c => c.id)));
  });
  it("draw 抽出的牌不重复且数量正确", () => {
    const drawn = draw(createDeck(tarotData), 10, mulberry32(7));
    expect(drawn).toHaveLength(10);
    expect(new Set(drawn.map(d => d.card.id)).size).toBe(10);
  });
  it("塔罗牌正逆位各约 50%", () => {
    const rng = mulberry32(99);
    const n = 10000;
    let rev = 0;
    for (let i = 0; i < n; i++) if (draw(createDeck(tarotData), 1, rng)[0].reversed) rev++;
    expect(rev / n).toBeGreaterThan(0.46);
    expect(rev / n).toBeLessThan(0.54);
  });
  it("神谕卡不产生逆位", () => {
    const drawn = draw(createDeck(oracleData), 5, mulberry32(1));
    expect(drawn.every(d => d.reversed === false)).toBe(true);
  });
  it("抽牌数量超过牌堆时报错", () => {
    expect(() => draw(createDeck(oracleData), 99)).toThrow();
  });
});
