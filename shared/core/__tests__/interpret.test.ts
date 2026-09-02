import { describe, it, expect } from "vitest";
import { templateInterpret, interpretWithFallback } from "../interpret";
import type { CardData, InterpretInput, Spread } from "../types";

const cardA: CardData = {
  id: "a", name: "愚人", nameEn: "The Fool", arcana: "major", number: 0, suit: null,
  keywords: ["开始", "自由", "冒险"], upright: "正位通用文案A", reversed: "逆位文案A",
  domains: { general: "通用领域文案A", love: "爱情领域文案A" },
  symbols: [], palette: { bg: "#000", fg: "#fff" }
};
const cardB: CardData = { ...cardA, id: "b", name: "高塔", keywords: ["骤变"], domains: { general: "通用领域文案B" } };

const spread: Spread = {
  id: "s", name: "时间之流", description: "", cardCount: 2,
  positions: [
    { name: "过去", meaning: "过往因素" },
    { name: "现在", meaning: "当前状态" }
  ]
};

function input(domain: "general" | "love", reversedB = false): InterpretInput {
  return {
    question: "我该换工作吗", domain, spread,
    drawn: [{ card: cardA, reversed: false }, { card: cardB, reversed: reversedB }]
  };
}

describe("模板解读引擎", () => {
  it("正位且领域命中时用领域文案", () => {
    const r = templateInterpret(input("love"));
    expect(r.positions[0].text).toContain("爱情领域文案A");
    expect(r.positions[0].text).toContain("愚人·正位");
    expect(r.source).toBe("template");
  });
  it("领域文案缺失时回退 general", () => {
    const r = templateInterpret(input("love"));
    expect(r.positions[1].text).toContain("通用领域文案B");
  });
  it("逆位时用逆位文案", () => {
    const r = templateInterpret(input("general", true));
    expect(r.positions[1].text).toContain("逆位文案A");
    expect(r.positions[1].text).toContain("高塔·逆位");
  });
  it("整体叙事含关键词与问题", () => {
    const r = templateInterpret(input("general"));
    expect(r.summary).toContain("我该换工作吗");
    expect(r.summary).toContain("开始");
    expect(r.summary).toContain("骤变");
  });
  it("大阿卡纳逆位时附上《逆位精解》逆位要点", () => {
    const magician: CardData = { ...cardA, id: "major-01", name: "魔术师", reversed: "逆位文案" };
    const r = templateInterpret({
      question: "q", domain: "general", spread,
      drawn: [{ card: magician, reversed: true }, { card: cardB, reversed: false }]
    });
    expect(r.positions[0].text).toContain("逆位要点");
    expect(r.positions[0].text).toContain("沟通不良");
    expect(r.positions[0].text).toContain("《塔罗逆位精解》");
  });
  it("无逆位要点映射的牌不追加要点", () => {
    const r = templateInterpret(input("general", true));
    expect(r.positions[1].text).not.toContain("逆位要点");
  });
  it("全正位时给出顺畅指引,大阿卡纳标注为核心课题", () => {
    const r = templateInterpret(input("general"));
    expect(r.summary).toContain("全为正位");
    expect(r.summary).toContain("主线课题");
    expect(r.summary).toContain("愚人");
  });
  it("全逆位时给出特殊结构提示", () => {
    const r = templateInterpret({
      question: "q", domain: "general", spread,
      drawn: [{ card: cardA, reversed: true }, { card: cardB, reversed: true }]
    });
    expect(r.summary).toContain("全为逆位");
    expect(r.summary).toContain("重新校准方向");
  });
  it("不传 aiCall 时回退模板", async () => {
    const r = await interpretWithFallback(input("general"));
    expect(r.source).toBe("template");
  });
  it("AI 失败时静默回退模板", async () => {
    const r = await interpretWithFallback(input("general"), async () => { throw new Error("boom"); });
    expect(r.source).toBe("template");
  });
  it("AI 成功时 summary 用 AI 文本,逐位保留模板", async () => {
    const r = await interpretWithFallback(input("general"), async () => "AI 深度解读文本");
    expect(r.source).toBe("ai");
    expect(r.summary).toBe("AI 深度解读文本");
    expect(r.positions[0].text).toContain("愚人·正位");
  });
});
