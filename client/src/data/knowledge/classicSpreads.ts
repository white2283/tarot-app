import type { ClassicSpread } from "./types";

/**
 * 经典牌阵库 · 摘自《塔罗牌经典牌阵合辑》(34 例)、《牌阵》、《塔罗入门经典牌阵》
 * 与占卜用的 SPREADS 相互独立,仅作知识展示。
 */
export const CLASSIC_SPREADS: ClassicSpread[] = [
  {
    id: "holy-triangle",
    name: "圣三角推测法",
    cardCount: 3,
    scope: "是非两难选择(可不可以、会不会、要不要),答案清晰明确",
    draw: "22 张主牌:由最上面数到第七张取出放 (1),剩下的重新数,第七张放 (2),再数一次第七张放 (3);手中剩下一张收进数过的牌叠。",
    source: "《牌阵》",
    positions: [
      { name: "(1) 过去", meaning: "过去的经验" },
      { name: "(2) 现在", meaning: "本人问题的现状" },
      { name: "(3) 未来", meaning: "对问题将来的预测结果" }
    ]
  },
  {
    id: "diamond",
    name: "钻石推测法",
    cardCount: 4,
    scope: "是非题,要求明确结果;与圣三角相似,但现状以两张牌综合解释",
    draw: "洗牌切牌后扇形摊开,求问者依序抽出四张,放在 (1) 至 (4) 的位置。",
    source: "《牌阵》",
    positions: [
      { name: "(1) 过去", meaning: "问题过去的状况" },
      { name: "(2)(3) 现状", meaning: "问题目前的情形,两张需综合解释" },
      { name: "(4) 结果", meaning: "问题的最后结果" }
    ]
  },
  {
    id: "grand-cross",
    name: "大十字推测法",
    cardCount: 5,
    scope: "爱情、友谊、学业、事业;简明呈现问题的阻碍、帮助及结果",
    draw: "洗牌后扇形摊开,求问者任挑一张放 (1),重复三次放 (2)(3)(4);剩余牌收拢正面朝上放一旁;把四张牌数字相加(小于等于 22 则从剩余牌堆找出对应数字的牌放 (5),超过 22 则个位十位相加)。",
    source: "《牌阵》",
    positions: [
      { name: "(1)(2) 外界影响", meaning: "能影响问题发展的外界人或事,可为阻碍或帮助" },
      { name: "(3) 原因", meaning: "问题发生的原因" },
      { name: "(4) 解决方式", meaning: "对问题最主要的解决方式" },
      { name: "(5) 结果", meaning: "问题的最终结果" }
    ]
  },
  {
    id: "choice",
    name: "二择一推测法(V 字型)",
    cardCount: 5,
    scope: "爱情、学业、事业;两难抉择的两条路径比较",
    draw: "洗牌前由求问者决定甲、乙路径分别代表哪个选择并牢记;洗牌切牌后,牌背朝上数到第六张放 (1);剩下的重数,第六、七张放 (2)(3);再重数,第六、七张放 (4)(5)。",
    source: "《牌阵》",
    positions: [
      { name: "(1) 求问者本身", meaning: "目前求问者的状况" },
      { name: "(2) 选择甲的现况", meaning: "选项 A 当前的基础与条件" },
      { name: "(3) 选择乙的现况", meaning: "选项 B 当前的基础与条件" },
      { name: "(4) 选择甲的未来", meaning: "选择 A 以后的发展" },
      { name: "(5) 选择乙的未来", meaning: "选择 B 以后的发展" }
    ]
  },
  {
    id: "love-star",
    name: "爱之星占卜法",
    cardCount: 6,
    scope: "爱情问题",
    draw: "随意抽六张牌,依序放在 (1) 至 (6),牌阵的摆放及顺序一定要按顺序。",
    source: "《激情塔罗》第 46 页 · 牌阵合辑 04",
    positions: [
      { name: "(1) 现状", meaning: "你所问的问题目前的状况" },
      { name: "(2) 女方心情", meaning: "女方的心情" },
      { name: "(3) 男方心情", meaning: "男方的心情" },
      { name: "(4) 过去", meaning: "你们相处的过去状况" },
      { name: "(5) 期望", meaning: "你的期望、愿望;若为坏牌代表会出现的阻碍" },
      { name: "(6) 结果", meaning: "最后结果" }
    ]
  },
  {
    id: "hexagram",
    name: "六芒星占卜法",
    cardCount: 7,
    scope: "各类型问题;台湾塔罗书普遍记载的经典牌阵",
    draw: "大秘仪:从上数起第七张放 (1),第八张 (2),第九张 (3);剩余牌再数第七、八、九、十张放 (4)(5)(6)(7)。小秘仪/78 张:随意抽七张依序摆放。",
    source: "《塔罗牌的灵测游戏》第 98 页 · 牌阵合辑 05",
    positions: [
      { name: "(1) 过去", meaning: "问题过去的状况" },
      { name: "(2) 现在", meaning: "问题现在的状况" },
      { name: "(3) 未来", meaning: "问题未来的状况" },
      { name: "(4) 策略", meaning: "解决此一问题的对应策略" },
      { name: "(5) 周遭", meaning: "周遭状况" },
      { name: "(6) 本人态度", meaning: "本人的态度(希望或恐惧)" },
      { name: "(7) 结果", meaning: "最后结果" }
    ]
  },
  {
    id: "karmic",
    name: "卡尔米克展开法",
    cardCount: 7,
    scope: "大秘仪;探索宿命、自我与灵魂课题",
    draw: "随意抽七张牌,依序放在 (1) 至 (7)。",
    source: "牌阵合辑 06(出处不详)",
    positions: [
      { name: "(1) 宿命", meaning: "宿命" },
      { name: "(2) 自我", meaning: "自我" },
      { name: "(3) 第一级影响", meaning: "影响你一辈子的重大事件" },
      { name: "(4) 第二级影响", meaning: "这辈子的第二种影响" },
      { name: "(5) Involution", meaning: "你来这世界的目的" },
      { name: "(6) Evolution", meaning: "你可以在这辈子完成什么" },
      { name: "(7) Karmic 平衡", meaning: "这辈子可以学到什么" }
    ]
  },
  {
    id: "seven-planets",
    name: "七行星推测法",
    cardCount: 7,
    scope: "运势;看一个人目前在各方面的状态",
    draw: "洗牌后扇形摊开,求问者任选七张,依序放到 (1) 至 (7) 的位置。",
    source: "《皮耶塔罗事件簿》第 198 页 · 《牌阵》",
    positions: [
      { name: "(1) 月亮", meaning: "家人及家庭状况" },
      { name: "(2) 土星", meaning: "智能及健康、精神状况" },
      { name: "(3) 金星", meaning: "情感" },
      { name: "(4) 太阳", meaning: "社交魅力及人际关系" },
      { name: "(5) 火星", meaning: "和对手的竞争状况" },
      { name: "(6) 木星", meaning: "物质的获取" },
      { name: "(7) 水星", meaning: "商业贸易、工作及学习状况" }
    ]
  },
  {
    id: "goblet",
    name: "酒杯占卜法",
    cardCount: 7,
    scope: "各类型问题;过去现在未来的连贯解读",
    draw: "大秘仪:先抽六张起来,第七张放 (1);再抽三张,第四、五张放 (2)(3);再抽三张,第四、五、六张放 (4)(5)(6);再抽三张,第四张放 (7)(即最后一张)。小秘仪/78 张:随意抽七张依序摆放。",
    source: "牌阵合辑 08(出处不详)",
    positions: [
      { name: "(1) 本意", meaning: "本意、心情或态度" },
      { name: "(2)(3) 关键", meaning: "问题的关键与解决方法(两张联合解释)" },
      { name: "(4) 近过去", meaning: "短期间的过去" },
      { name: "(5) 现在", meaning: "现在" },
      { name: "(6) 近未来", meaning: "短期间的未来" },
      { name: "(7) 结论", meaning: "结论" }
    ]
  },
  {
    id: "find-love",
    name: "寻找对象的占卜",
    cardCount: 5,
    scope: "爱情;寻找伴侣的心态与行动",
    draw: "随意抽五张牌,依序放在 (1) 至 (5)。",
    source: "《塔罗魔法书》第 106 页 · 牌阵合辑 01",
    positions: [
      { name: "(1) 自己", meaning: "你现在的心情、处境" },
      { name: "(2) 追求对象", meaning: "你希望追求的对象" },
      { name: "(3) 不喜欢的人", meaning: "你不喜欢的对象" },
      { name: "(4) 行动", meaning: "该采取的行动" },
      { name: "(5) 未来", meaning: "未来的发展、最后的结果" }
    ]
  },
  {
    id: "x-shape",
    name: "X 字牌型",
    cardCount: 5,
    scope: "各类型问题;心态、时机与成功机率",
    draw: "随意抽五张牌,依序放在 (1) 至 (5)。",
    source: "《塔罗魔法书 2 前途有卜》第 214 页 · 牌阵合辑 02",
    positions: [
      { name: "(1) 心态", meaning: "你自己的心态" },
      { name: "(2) 时机", meaning: "眼前的时机" },
      { name: "(3) 机率", meaning: "成功的机率" },
      { name: "(4) 影响", meaning: "影响的因素" },
      { name: "(5) 结果", meaning: "未来的发展、最后的结果" }
    ]
  },
  {
    id: "mirror",
    name: "镜像展开法",
    cardCount: 10,
    scope: "爱情、友谊、学业、事业;决定采取某种行动时,想知道后果",
    draw: "求问者先抽一张放中心 (0) 并翻开,再抽九张依序放 (1) 至 (9),(1) 盖过 (0),全部就位后逐一翻开解读。",
    source: "《牌阵》",
    positions: [
      { name: "(0) 关键", meaning: "问题解决的关键" },
      { name: "(1) 现状", meaning: "一人目前的状况" },
      { name: "(2) 精神", meaning: "精神状况或思考的特徵" },
      { name: "(3) 情感", meaning: "感性、情感方面的状况" },
      { name: "(4) 意外", meaning: "可能出现的意外事件" },
      { name: "(5) 近未来", meaning: "两、三个月内的状况" },
      { name: "(6) 他人", meaning: "其他人的想法、举动" },
      { name: "(7) 未考虑", meaning: "尚未考虑到的层面" },
      { name: "(8) 行动结果", meaning: "采取行动的结果" },
      { name: "(9) 结局", meaning: "最终的结局" }
    ]
  },
  {
    id: "solomon",
    name: "所罗门之星展开法",
    cardCount: 21,
    scope: "爱情、友谊、学业、事业;最适合没有特定问题的全面推测",
    draw: "使用全部 22 张大牌。洗牌切牌后牌面朝上,先找出「世界」放一边(检查过的牌依序叠回),世界之后依序七张放 (1) 至 (7);八到十四张叠在右下一层,十五到二十一张再叠一层;最后手中的「世界」代表求问者本人,放在面前。每个位置三张牌综合解释。",
    source: "《牌阵》",
    positions: [
      { name: "(1) 现状", meaning: "问题目前的实际状况" },
      { name: "(2) 事件", meaning: "即将发生的事件" },
      { name: "(3) 期望", meaning: "求问者对问题的期望、欲念" },
      { name: "(4) 运势", meaning: "这个问题的运势如何" },
      { name: "(5) 意外", meaning: "可能出现的意外" },
      { name: "(6) 敌人", meaning: "求问者没有注意到的敌人" },
      { name: "(7) 动机", meaning: "个人内心深处对问题的真正动机" }
    ]
  },
  {
    id: "natal-houses",
    name: "出生宫位图法",
    cardCount: 13,
    scope: "运势;解读一个人在某段时间内各方面的运势",
    draw: "洗牌切牌后,从上面数第七张放 (1),再依序取出后面的第一到第十二张放 (2) 至 (13);先掀中间 (13),再按 (1) 到 (12) 顺序掀牌。",
    source: "《牌阵》",
    positions: [
      { name: "(1) 个性", meaning: "个人特性、行事的风格" },
      { name: "(2) 金钱", meaning: "金钱运" },
      { name: "(3) 手足", meaning: "和兄弟姊妹的关系" },
      { name: "(4) 家庭", meaning: "家庭状况、和母亲的关系" },
      { name: "(5) 恋爱", meaning: "恋爱运、和子女的关系" },
      { name: "(6) 健康", meaning: "身体健康的状况" },
      { name: "(7) 人际", meaning: "人际关系、婚姻运" },
      { name: "(8) 性", meaning: "性生活状况" },
      { name: "(9) 学业", meaning: "学业运、海外旅行机运" },
      { name: "(10) 工作", meaning: "工作运、和父亲的关系" },
      { name: "(11) 朋友", meaning: "朋友的状态" },
      { name: "(12) 意外", meaning: "意外的事件" },
      { name: "(13) 整体", meaning: "整体运势的走向" }
    ]
  }
];
