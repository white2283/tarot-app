import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { SYMBOL_TYPES } from "../symbols";
import tarot from "../../data/cards.tarot.json";
import moonology from "../../data/cards.moonology.json";

// 源码级一致性测试:CardFace.tsx 是 React 组件,无法在 node 环境直接 import,
// 因此读取其源码,校验 RENDERERS 注册表覆盖了牌库实际用到的全部符号类型。
const src = readFileSync(
  new URL("../../../client/src/components/CardFace.tsx", import.meta.url),
  "utf8"
);
const blockStart = src.indexOf("const RENDERERS");
const block = src.slice(blockStart, src.indexOf("};", blockStart));
const rendererKeys = new Set(
  [...block.matchAll(/^\s*(\w[\w-]*)\s*:/gm)].map(m => m[1])
);

const usedTypes = new Set<string>();
for (const c of [...tarot.cards, ...moonology.cards]) {
  for (const s of c.symbols) usedTypes.add(s.type);
}

describe("牌面符号渲染器覆盖", () => {
  it("两份牌库用到的每种符号类型在 RENDERERS 中都有渲染器(不允许退化为通用火花)", () => {
    expect(usedTypes.size).toBeGreaterThan(0);
    for (const t of usedTypes) {
      expect(rendererKeys.has(t), `CardFace.tsx 缺少 "${t}" 渲染器`).toBe(true);
    }
  });
  it("RENDERERS 中的键都是 SYMBOL_TYPES 中的合法符号类型", () => {
    const symbolSet = new Set<string>(SYMBOL_TYPES);
    expect(rendererKeys.size).toBeGreaterThan(0);
    for (const k of rendererKeys) {
      expect(symbolSet.has(k), `RENDERERS 存在未知符号类型 "${k}"`).toBe(true);
    }
  });
});
