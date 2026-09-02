import { describe, it, expect } from "vitest";
import { skyTemplate } from "./skyReading";

describe("今日天象模板解读", () => {
  it("组合出含日月星座、月相、逆行与相位的人话文本", () => {
    const text = skyTemplate({
      sunLon: 144,   // 狮子座
      moonLon: 210,  // 天蝎座
      phase: "娥眉月",
      illum: 0.3,
      retroNames: ["土星"],
      aspects: [{ a: "木星", b: "火星", name: "拱", desc: "和谐顺遂" }]
    });
    expect(text).toContain("太阳在狮子座");
    expect(text).toContain("月亮在天蝎座");
    expect(text).toContain("娥眉月");
    expect(text).toContain("30%");
    expect(text).toContain("土星正在逆行");
    expect(text).toContain("木星拱火星");
  });
  it("无逆行无相位时不出现相关句子", () => {
    const text = skyTemplate({
      sunLon: 0, moonLon: 90, phase: "上弦月", illum: 0.5,
      retroNames: [], aspects: []
    });
    expect(text).not.toContain("逆行");
    expect(text).not.toContain("相位上");
  });
});
