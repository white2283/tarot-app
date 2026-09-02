import type { Spread } from "./types";

export const SPREADS: Spread[] = [
  {
    id: "daily", name: "每日一抽", description: "一张牌,一个今日指引", cardCount: 1,
    positions: [{ name: "今日指引", meaning: "今天值得关注与践行的主题" }]
  },
  {
    id: "time-flow", name: "时间之流", description: "过去、现在与未来的流动", cardCount: 3,
    positions: [
      { name: "过去", meaning: "影响现状的过往经验与因素" },
      { name: "现在", meaning: "问题目前的处境与状态" },
      { name: "未来", meaning: "趋势与可能的结果" }
    ]
  },
  {
    id: "body-mind-spirit", name: "身心灵", description: "三个层面审视当下的自己", cardCount: 3,
    positions: [
      { name: "身", meaning: "身体与物质层面的状态" },
      { name: "心", meaning: "心理与情绪层面的状态" },
      { name: "灵", meaning: "精神与灵性层面的状态" }
    ]
  },
  {
    id: "diamond", name: "钻石", description: "现状的双重视角,适合是非题", cardCount: 4,
    positions: [
      { name: "过去", meaning: "问题过去的状况" },
      { name: "现状之一", meaning: "目前情形的一面(与另一面综合解释)" },
      { name: "现状之二", meaning: "目前情形的另一面(与另一面综合解释)" },
      { name: "结果", meaning: "问题的最后结果" }
    ]
  },
  {
    id: "choice", name: "二择一", description: "两难抉择的两条路径比较", cardCount: 5,
    positions: [
      { name: "求问者现况", meaning: "你目前的状态与处境" },
      { name: "选择甲的现况", meaning: "选项 A 当前的基础与条件" },
      { name: "选择乙的现况", meaning: "选项 B 当前的基础与条件" },
      { name: "选择甲的未来", meaning: "若选 A,未来的发展走向" },
      { name: "选择乙的未来", meaning: "若选 B,未来的发展走向" }
    ]
  },
  {
    id: "grand-cross", name: "大十字", description: "简明呈现阻碍、帮助与结果", cardCount: 5,
    positions: [
      { name: "外界影响·一", meaning: "影响问题发展的外部人或事(可为阻碍或帮助)" },
      { name: "外界影响·二", meaning: "影响问题发展的外部人或事(可为阻碍或帮助)" },
      { name: "问题根源", meaning: "问题发生的原因" },
      { name: "解决方式", meaning: "对问题最主要的解决途径" },
      { name: "最终结果", meaning: "问题的最终结果" }
    ]
  },
  {
    id: "celtic-cross", name: "凯尔特十字", description: "经典全景牌阵,深入复杂问题", cardCount: 10,
    positions: [
      { name: "现状", meaning: "问题的核心处境" },
      { name: "横阻", meaning: "横亘眼前的阻碍或助力" },
      { name: "根基", meaning: "问题背后的深层基础" },
      { name: "过去的影响", meaning: "正在消退的过往因素" },
      { name: "目标", meaning: "显意识中的目标与期待" },
      { name: "未来走向", meaning: "即将展开的趋势" },
      { name: "自我认知", meaning: "你对自己与问题的看法" },
      { name: "环境与他人", meaning: "周围环境和他人对你的影响" },
      { name: "希望与恐惧", meaning: "内心深处的期待与担忧" },
      { name: "最终结果", meaning: "各因素汇聚的最终走向" }
    ]
  }
];

export function getSpread(id: string): Spread | undefined {
  return SPREADS.find(s => s.id === id);
}
