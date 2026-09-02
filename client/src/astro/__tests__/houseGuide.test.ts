import { describe, it, expect } from "vitest";
import { HOUSE_CORE, houseCore } from "../houseGuide";

describe("占星宫位知识库", () => {
  it("12 宫齐全,字段非空", () => {
    expect(HOUSE_CORE.length).toBe(12);
    for (const h of HOUSE_CORE) {
      expect(h.kw.trim()).not.toBe("");
      expect(h.core.trim()).not.toBe("");
    }
  });

  it("houseCore 越界钳制到 1-12", () => {
    expect(houseCore(1).core).toBe(HOUSE_CORE[0].core);
    expect(houseCore(12).core).toBe(HOUSE_CORE[11].core);
    expect(houseCore(0).core).toBe(HOUSE_CORE[0].core);
    expect(houseCore(99).core).toBe(HOUSE_CORE[11].core);
  });
});
