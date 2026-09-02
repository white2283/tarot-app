export interface InterpretPayload {
  question: string;
  domain: string;
  spreadName: string;
  items: { positionName: string; cardName: string; reversed: boolean; note?: string }[];
  mode?: "tarot" | "natal" | "sky";
}

/** 提示词版本:修改解读提示词后 +1,用于让 AI 缓存失效(旧缓存不会挡住新提示词) */
export const PROMPT_VERSION = 8;

export function buildPrompt(p: InterpretPayload): string {
  const lines = p.items.map((it, i) =>
    `${i + 1}. 位置「${it.positionName}」:${it.cardName}(${it.reversed ? "逆位" : "正位"})${it.note ? `\n   牌义参考:${it.note}` : ""}`);
  if (p.mode === "natal") {
    return [
      "你是一位经验丰富的职业占星师,熟悉《顺逆皆宜的人生》(相位心理学)、《人生的十二个面向》(宫位)、《当代占星研究》(行星与星座)的理论框架。请根据以下本命星盘数据,为求问者写一篇【完整、全面、深入】的中文本命解读。",
      "【最重要的要求:完整覆盖】星盘数据中列出的每一项都必须解读到,一个都不能少:① 上升点 ASC 与中天 MC;② 每一颗行星(太阳、月亮、水星、金星、火星、木星、土星、天王星、海王星)的落座与落宫;③ 每一组列出的相位。不允许省略任何行星、任何相位、任何落宫。",
      "【章节结构】严格按以下 14 章展开。章节标题只用短格式(如\"一、上升与人格面具\"),不要带冒号后的说明;各章内容要点如下:",
      "一、上升与人格面具:ASC 落座如何塑造第一印象与应对世界的方式,以及与太阳/月亮的一致或反差(同时说明中天 MC 落座);",
      "二、太阳:核心自我、意志与贯穿一生的生命主题;",
      "三、月亮:情绪需求、安全感来源与内在惯性;",
      "四、水星:思维方式、沟通风格与学习模式;",
      "五、金星:爱与被爱的方式、价值感与审美;",
      "六、火星:行动力、欲望、竞争与愤怒的表达;",
      "七、木星:扩张与信念所在的领域、幸运法则;",
      "八、土星:课题、边界、自律与成就路径;",
      "九、天王星:变革、独立与突破的方式;",
      "十、海王星:直觉、梦想、消融与灵性;",
      "十一、人生领域与落宫总览:梳理被重点强调的宫位及其对应的人生领域,说明能量的分布、聚集与失衡之处;",
      "十二、相位专题:把星盘数据中列出的每一组相位逐组解读,指出内在张力、天赋与需要整合的部分;",
      "十三、整合:从上升、太阳、月亮与整体落宫格局看人生主旋律,总结最突出的 1-2 个核心成长课题;",
      "十四、建议:给出警惕与提示(3-4 条,指出具体风险倾向与需要留意的行为),再给出 3 条具体、可践行的建议(结合具体落座落宫相位,不要泛泛而谈)。",
      "标题示例:\"一、上升与人格面具\"\"二、太阳\"\"十四、建议\"——只写章节名,不写要点。",
      "【语言】中文,专业而不晦涩,多用具体情境与比喻;对内心体验的描述要有层次;篇幅以\"覆盖完整、论述充分\"为准,不必刻意追求极短或极长。正文最后另起一行注明:本解读仅供娱乐参考。",
      `出生信息:${p.question}`,
      "星盘数据(行星均含落座、落宫与关键词):",
      ...lines
    ].join("\n");
  }
  if (p.mode === "sky") {
    return [
      "你是一位温和的占星师,正在为没有占星基础的读者写\"今日天象\"。请根据以下此刻天象(行星落座、相位、月相),用中文写一段 150-250 字的解读:",
      "要求:通俗具体,不堆术语;讲清今天的天空能量适合做什么、注意什么;相位翻译成人际关系/情绪/行动上的大白话;结尾给一句今日行动建议。",
      `此刻天象:${p.question}`,
      ...lines
    ].join("\n");
  }
  return [
    "你是一位温和而专业的塔罗解读师。请根据以下占卜信息,用中文给出一段 250-400 字的整体解读:",
    "要求:紧扣每条\"牌义参考\"来写,具体引用牌面意象与关键词,不泛泛而谈;把各位置串联成一个连贯叙事,指出它们之间的呼应与张力;结合问题的领域侧重;语气温和、具体、不说教;避免\"相信自己\"\"顺其自然\"这类空泛套话;结尾给一句可执行的建议。",
    `问题:${p.question || "(未填写)"}(领域:${p.domain === "love" ? "爱情" : "综合"})`,
    `牌阵:${p.spreadName}`,
    ...lines
  ].join("\n");
}

export async function callAi(prompt: string): Promise<string> {
  const base = process.env.AI_BASE_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "moonshot-v1-128k";
  // 输出上限可配置:小上下文/小输出端点(如 max_tokens 仅 2048 的模型)可调低 AI_MAX_TOKENS
  const maxTokensRaw = Number(process.env.AI_MAX_TOKENS ?? 8192);
  const maxTokens = Number.isFinite(maxTokensRaw) && maxTokensRaw > 0 ? Math.floor(maxTokensRaw) : 8192;
  // 温度可选:默认不传(OpenAI 兼容端点默认 1;某些推理模型只接受 1)。需要时设 AI_TEMPERATURE=0.8
  // 注意:Number("") === 0,必须判空,否则未设置时会误发 temperature:0
  const tempStr = process.env.AI_TEMPERATURE?.trim();
  const tempRaw = tempStr === undefined || tempStr === "" ? NaN : Number(tempStr);
  const temp = Number.isFinite(tempRaw) && tempRaw >= 0 && tempRaw <= 2 ? tempRaw : undefined;
  if (!base || !key) throw new Error("AI 未配置");

  let lastErr: unknown = new Error("AI 调用失败");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt)); // 过载退避
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 240_000);
    try {
      const body: Record<string, unknown> = {
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens
      };
      if (temp !== undefined) body.temperature = temp;
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      if (res.ok) {
        const j = await res.json() as any;
        return j.choices[0].message.content as string;
      }
      // 429(过载/限流)与 5xx 可重试,其余错误直接抛出
      lastErr = new Error(`AI HTTP ${res.status}`);
      if (res.status !== 429 && res.status < 500) {
        const bodyText = await res.text().catch(() => "");
        console.error("[ai] HTTP", res.status, "响应:", bodyText.slice(0, 600));
        throw lastErr;
      }
    } catch (err) {
      lastErr = err;
      if (err instanceof Error && /^AI HTTP (?!429|5\d\d)/.test(err.message)) throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
