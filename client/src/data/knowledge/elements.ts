import type { ElementCard } from "./types";

/** 四元素一览 · 摘自《四元素塔罗牌等关系》《塔罗入门十九课》 */
export const ELEMENT_CARDS: ElementCard[] = [
  {
    id: "fire",
    name: "火",
    suit: "权杖",
    nature: "意图、计划、信念、行动力",
    polarity: "阳性",
    season: "夏季",
    color: "红色",
    description:
      "火显示目的与方向,靠意志行动去「做」,是行动与行动力的代表。其品德为热情、勇气与创造力,庸德(缺点)则可能急躁、冲动。权杖 Ace 代表火元素的基本特质:创造、勇气、激情、机会。"
  },
  {
    id: "water",
    name: "水",
    suit: "圣杯",
    nature: "情感、感性、情绪、关系",
    polarity: "阴性",
    color: "蓝色",
    description:
      "水元素贴近情感,代表了解的感性层面。圣杯牌组的核心意义是感性、情绪、感情等心理层面的东西,能量向内流动;圣杯 Ace 代表爱情、情感、直觉和亲密。"
  },
  {
    id: "air",
    name: "风",
    suit: "宝剑",
    nature: "智识、理性、思考、科学",
    polarity: "阳性",
    color: "黄色",
    description:
      "风元素表现智识与理性层面,代表科学、智慧与思考。与火靠实际行动实现相比,风主要通过思考去实现挑战。宝剑 Ace 是一组知性、思想与理性的牌,关心正义、真相和理性原则。"
  },
  {
    id: "earth",
    name: "土",
    suit: "星币",
    nature: "固定、成形、物质化、实践",
    polarity: "阴性",
    season: "冬季",
    color: "绿色",
    description:
      "土元素代表固定、成形、物质化与实践,没有火的开创、水的感性、风的理智,却最务实而实际。星币 Ace 代表丰饶、实际,星币组关心安全感、财富与繁荣。"
  }
];
