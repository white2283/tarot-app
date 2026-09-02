import { BASICS, REVERSED, ELEMENTS, COURT, TIPS } from "./articles";
import { FAQ } from "./faq";
import { ELEMENT_CARDS } from "./elements";
import { REVERSED_NOTES } from "./reversedNotes";
import { CLASSIC_SPREADS } from "./classicSpreads";

export interface KnowledgeCategory {
  id: string;
  label: string;
  icon: string;
  blurb: string;
}

/** 知识分类导航 */
export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  { id: "basics", label: "入门基础", icon: "📖", blurb: "塔罗是什么、牌的构成、占卜流程与如何提问" },
  { id: "meanings", label: "牌义速查", icon: "🃏", blurb: "78 张牌正逆位释义速查(附大阿卡纳逆位要点)" },
  { id: "spreads", label: "牌阵大全", icon: "✦", blurb: "14 个经典牌阵:适用范围、取牌方式、牌位含义与对比" },
  { id: "reversed", label: "正逆位", icon: "🔄", blurb: "逆位理论:认识逆位置与四大解读方法" },
  { id: "elements", label: "四元素", icon: "🔥", blurb: "火水土风:四元素学说与塔罗对应" },
  { id: "court", label: "宫廷牌", icon: "👑", blurb: "16 张宫廷牌:四组 × 四阶级的人格特质" },
  { id: "tips", label: "读牌技巧", icon: "🎭", blurb: "R.I.T.E. 解读法与读牌 21 式" },
  { id: "faq", label: "常见问题", icon: "❓", blurb: "初学者常见疑问答疑" }
];

export {
  BASICS,
  REVERSED,
  ELEMENTS,
  COURT,
  TIPS,
  FAQ,
  ELEMENT_CARDS,
  REVERSED_NOTES,
  CLASSIC_SPREADS
};
