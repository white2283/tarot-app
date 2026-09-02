/**
 * 占星知识:十二星座与行星通论
 * 摘自《当代占星研究》(苏·汤普金斯 / 江语涵 译,全书 OCR 整理);
 * 行星关键词同时参考《顺逆皆宜的人生》第一章及应用内既有星历元数据。
 */

export interface SignCard {
  name: string;
  element: string;
  mode: string;
  ruler: string;
  essence: string;
  traits: string[];
}

export const SIGN_CARDS: SignCard[] = [
  { name: "牡羊座", element: "火", mode: "创始", ruler: "火星", essence: "新的开端与行动的开创者",
    traits: ["喜欢抢第一", "天真而不造作", "冲动与热切", "行动挂帅", "非黑即白"] },
  { name: "金牛座", element: "土", mode: "固定", ruler: "金星", essence: "维持、扎根与累积",
    traits: ["最有耐力与踏实", "安全感与稳定", "感官与享乐", "顽固果决", "生产具体事物"] },
  { name: "双子座", element: "风", mode: "变动", ruler: "水星", essence: "联结与沟通的法则",
    traits: ["好奇心强", "搜集与传播信息", "善变灵活", "害怕承诺", "追求多样性"] },
  { name: "巨蟹座", element: "水", mode: "创始", ruler: "月亮", essence: "归属与情绪的守护者",
    traits: ["家庭观念强", "情绪的记忆", "多愁善感", "执著与被需要", "收藏与囤积"] },
  { name: "狮子座", element: "火", mode: "固定", ruler: "太阳", essence: "独特与荣耀的舞台",
    traits: ["渴望被瞩目", "忠诚慷慨", "创造与表演", "自尊自重", "温暖宽大"] },
  { name: "处女座", element: "土", mode: "变动", ruler: "水星", essence: "分辨与服务的精工者",
    traits: ["分析与评估", "拣选有用信息", "谦逊服务", "专注细节", "追求完善"] },
  { name: "天秤座", element: "风", mode: "创始", ruler: "金星", essence: "平衡与关系的桥梁",
    traits: ["公正与和谐", "伙伴关系", "优雅有分寸", "不喜冲突", "善留好印象"] },
  { name: "天蝎座", element: "水", mode: "固定", ruler: "冥王星", essence: "深刻与蜕变的力量",
    traits: ["深沉投入", "冰山般情绪", "洞察与机警", "不肯妥协", "保密与探秘"] },
  { name: "射手座", element: "火", mode: "变动", ruler: "木星", essence: "自由与意义的探索者",
    traits: ["远方与信仰", "乐观冒险", "宽恕慷慨", "粗心草率", "兴趣广泛"] },
  { name: "摩羯座", element: "土", mode: "创始", ruler: "土星", essence: "结构与成就的攀登者",
    traits: ["自我克制", "勤劳专业", "社会结构", "企图心强", "尊崇传统与经验"] },
  { name: "水瓶座", element: "风", mode: "固定", ruler: "天王星", essence: "自由平等与前瞻视野",
    traits: ["客观抽离", "理性人道", "求真直言", "社会良知", "进步改革"] },
  { name: "双鱼座", element: "水", mode: "变动", ruler: "海王星", essence: "融合与慈悲的海洋",
    traits: ["慈悲包容", "梦幻难捉摸", "自我感薄弱", "灵性", "拥抱而非排拒"] }
];

export interface PlanetCard {
  name: string;
  glyph: string;
  essence: string;
  traits: string[];
}

export const PLANET_CARDS: PlanetCard[] = [
  { name: "太阳", glyph: "☉", essence: "自我与意志:身份认同、生命活力与重要性",
    traits: ["自我意识", "意志力", "渴望成为重要人物", "父亲或男性伴侣", "荣耀与肯定"] },
  { name: "月亮", glyph: "☽", essence: "情绪与内在:需求、滋养、过往与家庭",
    traits: ["情绪与需求", "滋养与安全感", "母亲与家庭", "潜意识与记忆", "过往的惯性"] },
  { name: "水星", glyph: "☿", essence: "思考与沟通:心智、言语与联结",
    traits: ["思考与学习", "言语表达", "信息联结", "邻居与手足", "交通与贸易"] },
  { name: "金星", glyph: "♀", essence: "爱与美:关系、价值与和谐",
    traits: ["爱与被爱", "审美与品味", "关系与和谐", "金钱与价值", "受欢迎的需求"] },
  { name: "火星", glyph: "♂", essence: "行动与欲望:意志、竞争与性",
    traits: ["行动力", "勇气与胆识", "竞争与对抗", "欲望与性", "与父亲对抗的课题"] },
  { name: "木星", glyph: "♃", essence: "扩张与机遇:信仰、意义与远方",
    traits: ["扩张与好运", "信仰与意义", "长途旅行", "高等教育", "慷慨与乐观"] },
  { name: "土星", glyph: "♄", essence: "责任与边界:自律、时间与权威",
    traits: ["自律与克制", "责任与边界", "时间与成熟", "权威与父亲", "认清恐惧"] },
  { name: "天王星", glyph: "♅", essence: "变革与自由:突破、独立与科技",
    traits: ["变革与突破", "独立与自由", "科技与电", "突发与革新", "抽离客观"] },
  { name: "海王星", glyph: "♆", essence: "梦境与直觉:灵感、消融与灵性",
    traits: ["灵感与想象", "梦境与直觉", "消融与迷惘", "灵性与慈悲", "理想化倾向"] },
  { name: "冥王星", glyph: "♇", essence: "转化与权力:死亡与重生、深层力量",
    traits: ["深刻转化", "权力与掌控", "死亡与重生", "隐秘与探查", "危机中的力量"] }
];
