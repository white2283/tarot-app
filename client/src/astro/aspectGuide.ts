/**
 * 占星相位知识库
 * 相位类型含义摘自《顺逆皆宜的人生》(苏·汤普金斯 / 胡因梦 译,全书 OCR 整理);
 * 行星组合关键词摘自该书「第二部 相位的组合」各章节首行关键词。
 */

export interface AspectDef {
  angle: number;
  name: string;
  orb: number;
  /** soft=柔和 / hard=困难 / neutral=中性 */
  kind: "soft" | "hard" | "neutral";
  essence: string;
  detail: string;
}

export const ASPECT_TYPES: AspectDef[] = [
  { angle: 0, name: "合", orb: 8, kind: "neutral", essence: "能量融合、合一与主观盲点",
    detail: "两颗行星能量融合为一,如同脸上的胎记难以自见;带来强烈的自我认同与主观倾向。它不区分好坏,重点在于如何运用——多颗行星合相形成星群时,该特质会被大幅强化。" },
  { angle: 30, name: "半六合", orb: 2, kind: "soft", essence: "轻支持与联结",
    detail: "相邻星座间的轻相位,单独出现时意义较弱;能带来支持与确定感,将两个原本无关的相位联结起来,整合内在的次人格。" },
  { angle: 45, name: "半刑", orb: 2, kind: "hard", essence: "埋藏的无意识张力",
    detail: "目标清楚、会促发具体的事件,但两种能量整合困难;议题深埋无意识不易察觉,常以外在事件戏剧化地爆发出来。" },
  { angle: 60, name: "六合", orb: 4, kind: "soft", essence: "机会与诱使",
    detail: "落在相容却不同的元素上,带来刺激与机会;有资质但需付出努力才能发挥,带有金星般的享受与价值感,重视合作议题。" },
  { angle: 90, name: "刑", orb: 8, kind: "hard", essence: "紧张与成长的引擎",
    detail: "不相容元素间的冲突,能量受阻而产生紧绷感;迫使行动与和解,努力解决它的过程就是成长与成熟,不行动反而会被能量反噬。" },
  { angle: 120, name: "拱", orb: 8, kind: "soft", essence: "与生俱来的才华与疗愈",
    detail: "同元素间的和谐联结,轻松而被动,代表天赋与疗愈;但容易让人拣容易的路走,对自己的才华习以为常而不自知。" },
  { angle: 135, name: "八分之三", orb: 2, kind: "hard", essence: "与半刑同源,戏剧化显现",
    detail: "与半刑同类:目标清楚、能具体地生产出东西,但无意识议题常以外在事件显现;紧密度高时,比宽松的四分相更重要。" },
  { angle: 150, name: "十二分之五相", orb: 2, kind: "hard", essence: "额外干扰与成长磨合",
    detail: "无共通元素的星座之间,带来额外的压力与摩擦、缺乏韵律感;常见于关系比对,促成双方修正与成长。" },
  { angle: 180, name: "冲", orb: 8, kind: "hard", essence: "摆荡两端与关系课题",
    detail: "对立位置的能量互相牵引,内在如两股声音拉扯、容易摆荡到两端;特别显现在关系领域,透过觉知与整合,才能在对立中发展出洞见。" }
];

/** 行星组合关键词(摘自《顺逆皆宜》第二部各章首行) */
export const PAIR_KEYWORDS: Record<string, string[]> = {
  "sun-moon": ["渴望与需求", "未来与过去", "父亲与母亲", "显意识与潜意识"],
  "sun-mercury": ["自我认知", "独立思考", "强烈的主见", "知识的重要性"],
  "sun-venus": ["重视关系", "在意是否受欢迎", "性格柔顺", "自爱与爱心", "追求心灵宁静"],
  "sun-mars": ["与自己作对", "与父亲对抗", "从胜利中获得荣耀", "重视勇气与胆识"],
  "sun-saturn": ["自我否定", "自律与自制", "权威的重要性", "认清恐惧", "时间的重要性"],
  "moon-venus": ["热爱和平", "善于合作", "在意公平", "母亲有爱心", "美丽的家", "尊重女性"],
  "moon-mars": ["强烈保护欲", "快速的滋养反应", "情绪中带着愤怒", "冲突矛盾的情绪"],
  "venus-mars": ["爱情冒险家", "爱的竞争性", "三角关系", "带有性渴望的爱", "自我确立与妥协"],
  "venus-jupiter": ["夸张的感受", "美好的人生", "财富", "重视生命意义", "享乐"],
  "venus-saturn": ["否定情感", "爱的克制", "爱与纪律", "严肃的关系", "爱的证明", "时间与金钱"]
};

export function aspectTypeByAngle(angle: number): AspectDef | undefined {
  return ASPECT_TYPES.find(a => a.angle === angle);
}

export function pairKeywords(keyA: string, keyB: string): string[] | undefined {
  return PAIR_KEYWORDS[`${keyA}-${keyB}`] ?? PAIR_KEYWORDS[`${keyB}-${keyA}`];
}

/** 组合一段相位解读:行星组合关键词 + 相位类型要点 */
export function aspectInterpretation(keyA: string, keyB: string, angle: number): string {
  const def = aspectTypeByAngle(angle);
  if (!def) return "";
  const kws = pairKeywords(keyA, keyB);
  return `${def.name}相:${def.essence}。${kws ? `此组合的课题:${kws.join("、")}。` : ""}${def.detail}`;
}
