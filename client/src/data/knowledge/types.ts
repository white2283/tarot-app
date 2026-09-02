/** 塔罗知识库数据结构 */

/** 一篇文章:由若干带小标题的段落组成 */
export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  /** 内容来源资料 */
  source?: string;
  /** 一句话导语 */
  lead?: string;
  sections: ArticleSection[];
}

/** 常见问题 */
export interface FaqItem {
  q: string;
  a: string;
}

/** 经典牌阵(知识库版,与占卜牌阵 SPREADS 相互独立) */
export interface ClassicSpread {
  id: string;
  name: string;
  cardCount: number;
  /** 适用范围 */
  scope: string;
  /** 取牌方式说明 */
  draw?: string;
  /** 出处资料 */
  source?: string;
  positions: { name: string; meaning: string }[];
}

/** 元素卡片 */
export interface ElementCard {
  id: string;
  name: string;
  suit: string;
  nature: string;
  polarity: string;
  season?: string;
  color?: string;
  description: string;
}
