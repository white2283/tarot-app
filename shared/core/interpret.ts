import type { InterpretInput, Interpretation, PositionReading } from "./types";
import { getReversedNotes } from "./reversedNotes";

/**
 * 模板解读引擎
 * 除基础拼接外,接入《塔罗逆位精解》的知识:
 *  1. 大阿卡纳逆位时附上「逆位要点」(延伸思考关键词);
 *  2. 整体叙事根据正逆位结构(全正 / 全逆 / 逆位居多)给出不同指引;
 *  3. 大阿卡纳出现时标注为牌阵中的核心课题。
 */
export function templateInterpret(input: InterpretInput): Interpretation {
  const positions: PositionReading[] = input.drawn.map((d, i) => {
    const position = input.spread.positions[i];
    const orientation = d.reversed ? "逆位" : "正位";
    const copy = d.reversed
      ? (d.card.reversed ?? d.card.domains.general)
      : (input.domain !== "general" && d.card.domains[input.domain]
          ? d.card.domains[input.domain]!
          : d.card.domains.general);
    let text = `${d.card.name}·${orientation} —— ${position.meaning}。${copy}`;
    if (d.reversed) {
      const notes = getReversedNotes(d.card.id);
      if (notes) text += `。逆位要点:${notes.join("、")}(《塔罗逆位精解》)`;
    }
    return { position, drawn: d, text };
  });

  const kws = input.drawn.map(d => d.card.keywords[0]);
  const reversedCount = input.drawn.filter(d => d.reversed).length;
  const total = input.drawn.length;

  // 正逆位结构指引(《塔罗逆位精解》:全正/全逆被赋予特殊意义,逆位居多宜内观调整)
  const structureNote = reversedCount === 0
    ? "牌面全为正位,能量顺畅无碍,可以顺着指引的方向稳步前行。"
    : reversedCount === total
      ? "牌面全为逆位,是一组被赋予特殊意义的极端信号:此时不宜仓促行动,宜彻底内观、重新校准方向,等待能量回正。"
      : reversedCount > total / 2
        ? "逆位居多,提示当下宜内观与调整,暂缓重大行动。"
        : "牌面能量总体顺畅,可以顺着指引的方向稳步前行。";

  // 大阿卡纳主线提示(大牌象征人生重大课题,为牌阵中的核心线索)
  const majors = input.drawn.filter(d => d.card.arcana === "major").map(d => d.card.name);
  const majorNote = majors.length > 0
    ? `大阿卡纳「${majors.join("、")}」构成牌阵的主线课题,提示这是当下人生层面值得重视的重要功课。`
    : "";

  const summary = `关于「${input.question.trim() || "你心中的问题"}」,${input.spread.name}给出的线索是:${kws.join("、")}。${majorNote}${structureNote}`;
  return { summary, positions, source: "template" };
}

export type AiCall = (input: InterpretInput) => Promise<string>;

export async function interpretWithFallback(input: InterpretInput, aiCall?: AiCall): Promise<Interpretation> {
  const base = templateInterpret(input);
  if (!aiCall) return base;
  try {
    const text = await aiCall(input);
    return { ...base, summary: text, source: "ai" };
  } catch {
    return base;
  }
}
