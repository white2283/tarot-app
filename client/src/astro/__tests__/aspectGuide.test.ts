import { describe, it, expect } from "vitest";
import { ASPECT_TYPES, PAIR_KEYWORDS, aspectTypeByAngle, pairKeywords, aspectInterpretation } from "../aspectGuide";

describe("占星相位知识库", () => {
  it("相位类型:9 种,角度唯一,字段齐全", () => {
    expect(ASPECT_TYPES.length).toBe(9);
    const angles = new Set(ASPECT_TYPES.map(a => a.angle));
    expect(angles.size).toBe(9);
    for (const a of ASPECT_TYPES) {
      expect(a.name.trim()).not.toBe("");
      expect(a.essence.trim()).not.toBe("");
      expect(a.detail.trim()).not.toBe("");
      expect(["soft", "hard", "neutral"]).toContain(a.kind);
    }
  });

  it("按角度查相位类型", () => {
    expect(aspectTypeByAngle(90)?.name).toBe("刑");
    expect(aspectTypeByAngle(0)?.name).toBe("合");
    expect(aspectTypeByAngle(180)?.name).toBe("冲");
    expect(aspectTypeByAngle(123)).toBeUndefined();
  });

  it("行星组合关键词:顺序无关,未收录组合返回 undefined", () => {
    expect(pairKeywords("sun", "moon")).toEqual(pairKeywords("moon", "sun"));
    expect(pairKeywords("sun", "venus")?.length).toBeGreaterThan(0);
    expect(pairKeywords("venus", "mars")?.join()).toContain("爱情");
    expect(pairKeywords("uranus", "pluto")).toBeUndefined();
  });

  it("组合解读包含相位要点与组合课题", () => {
    const t = aspectInterpretation("sun", "moon", 90);
    expect(t).toContain("刑相");
    expect(t).toContain("紧张");
    expect(t).toContain("渴望与需求");
  });
});
