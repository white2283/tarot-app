import { describe, it, expect } from "vitest";
import {
  REVERSED_NOTES, CLASSIC_SPREADS, BASICS, REVERSED, ELEMENTS,
  COURT, TIPS, FAQ, ELEMENT_CARDS
} from "../index";
import tarot from "../../../../../shared/data/cards.tarot.json";

const tarotCards = (tarot as { cards: { id: string; arcana: string }[] }).cards;
const majors = tarotCards.filter(c => c.arcana === "major");

describe("知识库数据完整性", () => {
  it("逆位要点:恰好覆盖 22 张大阿卡纳,id 均真实存在且要点非空", () => {
    const ids = Object.keys(REVERSED_NOTES);
    expect(ids.length).toBe(22);
    for (const id of ids) {
      const card = majors.find(c => c.id === id);
      expect(card, `缺少大阿卡纳 ${id}`).toBeTruthy();
      expect(REVERSED_NOTES[id].length).toBeGreaterThan(0);
    }
  });

  it("经典牌阵:id 唯一,位置数介于 1 与牌数之间,各字段非空", () => {
    const ids = new Set(CLASSIC_SPREADS.map(s => s.id));
    expect(ids.size).toBe(CLASSIC_SPREADS.length);
    for (const s of CLASSIC_SPREADS) {
      expect(s.name.trim()).not.toBe("");
      expect(s.scope.trim()).not.toBe("");
      expect(s.cardCount).toBeGreaterThan(0);
      expect(s.positions.length).toBeGreaterThan(0);
      expect(s.positions.length).toBeLessThanOrEqual(s.cardCount);
      for (const p of s.positions) {
        expect(p.name.trim()).not.toBe("");
        expect(p.meaning.trim()).not.toBe("");
      }
    }
  });

  it("文章分类:id 唯一且内容非空;FAQ 非空;四元素齐全", () => {
    for (const arts of [BASICS, REVERSED, ELEMENTS, COURT, TIPS]) {
      const ids = new Set(arts.map(a => a.id));
      expect(ids.size).toBe(arts.length);
      for (const a of arts) {
        expect(a.title.trim()).not.toBe("");
        expect(a.sections.length).toBeGreaterThan(0);
        for (const s of a.sections) expect(s.paragraphs.length).toBeGreaterThan(0);
      }
    }
    expect(FAQ.length).toBeGreaterThan(0);
    for (const f of FAQ) {
      expect(f.q.trim()).not.toBe("");
      expect(f.a.trim()).not.toBe("");
    }
    expect(ELEMENT_CARDS.length).toBe(4);
    expect(new Set(ELEMENT_CARDS.map(e => e.id)).size).toBe(4);
  });
});
