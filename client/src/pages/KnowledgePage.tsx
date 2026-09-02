import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  KNOWLEDGE_CATEGORIES, BASICS, REVERSED, ELEMENTS, COURT, TIPS,
  FAQ, ELEMENT_CARDS, REVERSED_NOTES, CLASSIC_SPREADS
} from "../data/knowledge";
import type { KnowledgeArticle, ClassicSpread } from "../data/knowledge/types";
import type { CardData } from "../../../shared/core/types";
import { DECKS } from "../decks";
import CardFace from "../components/CardFace";

/* ------------------------------------------------------------------ */
/* 通用小组件                                                           */
/* ------------------------------------------------------------------ */

/** 文章折叠卡片 */
function ArticleCard({ article, index }: { article: KnowledgeArticle; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 hover:bg-gold/5 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-goldlt tracking-widest">{article.title}</div>
            {article.lead && <div className="text-xs text-gold/60 mt-1">{article.lead}</div>}
          </div>
          <span className="text-gold/50 shrink-0">{open ? "收起 ▲" : "展开 ▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gold/15">
          {article.source && <p className="text-[11px] text-gold/40 tracking-wider mt-3">出处:{article.source}</p>}
          {article.sections.map((sec, i) => (
            <div key={i} className="mt-3">
              {sec.heading && <h4 className="text-gold tracking-widest text-sm mb-1.5">✦ {sec.heading}</h4>}
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="text-sm leading-loose opacity-90 text-gold/90 mb-2 whitespace-pre-wrap">{p}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 文章列表视图 */
function ArticleView({ articles }: { articles: KnowledgeArticle[] }) {
  return (
    <div className="flex flex-col gap-4">
      {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
    </div>
  );
}

/** 常见问题折叠列表 */
function FaqView() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQ.map((it, i) => (
        <div key={i} className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
          <button onClick={() => setOpen(v => (v === i ? null : i))}
            className="w-full text-left px-5 py-3.5 hover:bg-gold/5 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <span className="text-goldlt text-sm tracking-wider">Q{i + 1}. {it.q}</span>
              <span className="text-gold/50 shrink-0">{open === i ? "收起 ▲" : "展开 ▼"}</span>
            </div>
          </button>
          {open === i && (
            <div className="px-5 pb-4 border-t border-gold/15">
              <p className="text-sm leading-loose opacity-90 mt-3">{it.a}</p>
            </div>
          )}
        </div>
      ))}
      <p className="text-[11px] text-gold/40 tracking-wider mt-2">内容摘自《向日葵答塔罗初学者常见问题》</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 牌义速查                                                            */
/* ------------------------------------------------------------------ */

type FilterId = "all" | "major" | "wands" | "cups" | "swords" | "pentacles";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "全部 78 张" },
  { id: "major", label: "大阿卡纳" },
  { id: "wands", label: "权杖" },
  { id: "cups", label: "圣杯" },
  { id: "swords", label: "宝剑" },
  { id: "pentacles", label: "星币" }
];

function CardModal({ card, onClose }: { card: CardData; onClose: () => void }) {
  const notes = REVERSED_NOTES[card.id];
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overscroll-contain"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        onClick={e => e.stopPropagation()}
        className="relative max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/40 bg-ink/90 shadow-[0_0_40px_rgba(212,175,55,0.15)] p-6 max-w-md w-full">
        <button onClick={onClose} aria-label="关闭"
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full border border-gold/50 bg-ink text-gold/70 hover:text-gold">
          ✕
        </button>
        <div className="flex gap-5">
          <div className="w-28 shrink-0">
            <CardFace card={card} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-goldlt tracking-widest">{card.name}</h3>
            <p className="text-[11px] text-gold/50 tracking-[0.2em] mt-0.5">{card.nameEn.toUpperCase()}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {card.keywords.map(k => (
                <span key={k} className="text-[11px] border border-gold/30 rounded-full px-2 py-0.5 text-gold/80">{k}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 text-sm leading-relaxed">
          <div>
            <div className="text-gold text-xs tracking-widest mb-1">▸ 正位</div>
            <p className="opacity-90">{card.upright}</p>
          </div>
          <div>
            <div className="text-gold text-xs tracking-widest mb-1">▸ 逆位</div>
            <p className="opacity-90">{card.reversed ?? "本牌不区分逆位"}</p>
          </div>
          <div>
            <div className="text-gold text-xs tracking-widest mb-1">▸ 领域释义</div>
            <p className="opacity-80">{card.domains.general}</p>
            {card.domains.love && <p className="opacity-80 mt-1">爱情:{card.domains.love}</p>}
          </div>
          {notes && (
            <div className="border border-gold/20 rounded-lg bg-gold/5 px-3 py-2.5">
              <div className="text-gold text-xs tracking-widest mb-1">▸ 逆位要点(《塔罗逆位精解》)</div>
              <div className="flex flex-wrap gap-1.5">
                {notes.map(n => (
                  <span key={n} className="text-[11px] text-gold/90">{n}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MeaningsView() {
  const cards = useMemo(() => DECKS.rws.cards, []);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CardData | null>(null);

  // 今日一牌:按日期确定性选牌;随机一牌:真随机
  const todayCard = useMemo(() => {
    const d = new Date();
    const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    return cards[seed % cards.length];
  }, [cards]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(c => {
      if (filter === "major" && c.arcana !== "major") return false;
      if (filter !== "all" && filter !== "major" && c.suit !== filter) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
        || c.keywords.some(k => k.toLowerCase().includes(q));
    });
  }, [cards, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelected(todayCard)}
            className="text-xs tracking-widest rounded-full border border-gold text-goldlt bg-gold/10 px-4 py-2 transition-all hover:shadow-[0_0_14px_rgba(212,175,55,0.3)]">
            ✦ 今日一牌({todayCard.name})
          </button>
          <button onClick={() => setSelected(cards[Math.floor(Math.random() * cards.length)])}
            className="text-xs tracking-widest rounded-full border border-gold/40 text-gold/80 px-4 py-2 transition-all hover:bg-gold/10">
            🎲 随机一牌
          </button>
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索牌名 / 关键词(如: 爱情、改变)…"
          className="bg-ink/50 border border-gold/25 rounded-xl px-4 py-2.5 text-sm text-goldlt placeholder:text-gold/30 focus:outline-none focus:border-gold/60 transition-colors" />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-xs tracking-widest rounded-full border px-3 py-1.5 transition-all ${
                filter === f.id
                  ? "border-gold text-goldlt bg-gold/10"
                  : "border-gold/25 opacity-50 hover:opacity-90"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gold/40 tracking-wider mb-3">共 {list.length} 张 · 点击牌面查看完整释义</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
        {list.map(c => (
          <motion.button key={c.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(c)}
            className="flex flex-col items-center gap-1 group">
            <div className="w-full aspect-[5/9] overflow-hidden rounded-lg border border-gold/20 group-hover:border-gold/60 group-hover:shadow-[0_0_14px_rgba(212,175,55,0.25)] transition-all">
              <CardFace card={c} />
            </div>
            <span className="text-[10px] text-gold/70 leading-tight text-center line-clamp-1">{c.name}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected && <CardModal card={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 牌阵大全                                                            */
/* ------------------------------------------------------------------ */

function SpreadModal({ spread, onClose }: { spread: ClassicSpread; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overscroll-contain"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        onClick={e => e.stopPropagation()}
        className="relative max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/40 bg-ink/90 shadow-[0_0_40px_rgba(212,175,55,0.15)] p-6 max-w-lg w-full">
        <button onClick={onClose} aria-label="关闭"
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full border border-gold/50 bg-ink text-gold/70 hover:text-gold">
          ✕
        </button>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-goldlt tracking-widest">{spread.name}</h3>
          <span className="text-[11px] border border-gold/30 rounded-full px-2.5 py-1 text-gold/80">{spread.cardCount} 张牌</span>
        </div>
        <p className="text-xs text-gold/60 tracking-wider mt-2">适用范围:{spread.scope}</p>
        {spread.source && <p className="text-[11px] text-gold/40 mt-1">出处:{spread.source}</p>}
        {spread.draw && (
          <div className="mt-3 border border-gold/20 rounded-lg bg-gold/5 px-3 py-2.5">
            <div className="text-gold text-xs tracking-widest mb-1">取牌方式</div>
            <p className="text-xs leading-relaxed opacity-85">{spread.draw}</p>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {spread.positions.map((p, i) => (
            <div key={i} className="border-b border-gold/10 pb-2 last:border-0">
              <div className="text-gold text-xs tracking-widest">{p.name}</div>
              <p className="text-xs opacity-80 mt-0.5">{p.meaning}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** 牌阵对比:每个经典牌阵的一句话结构特点(展示用) */
const SPREAD_NOTES: Record<string, string> = {
  "holy-triangle": "三张时间线,是非两难的最简答案",
  "diamond": "与圣三角同型,但现状用两张牌交叉验证",
  "grand-cross": "外界影响×2 + 根源 + 解法 + 结果,看阻碍与帮助",
  "choice": "V 字双路径,甲乙选项的现况与未来对比",
  "love-star": "爱情专测,含双方心情、过去与期望",
  "hexagram": "六芒星,时间线 + 策略 / 态度 / 周遭 / 结果",
  "karmic": "大秘仪七张,探宿命、自我与灵魂课题",
  "seven-planets": "按七行星分领域,看各方面运势",
  "goblet": "连贯时间解读:本意 / 关键 / 过去现在未来 / 结论",
  "find-love": "寻爱专测:自己 / 对象 / 行动 / 未来",
  "x-shape": "心态 / 时机 / 机率 / 影响 / 结果 五要素",
  "mirror": "中心关键 + 九张环绕,评估行动后果",
  "solomon": "22 张大牌三层,无特定问题的全面推测",
  "natal-houses": "12 宫位 + 整体,看一段时期各方运势"
};

/** 牌阵区别的四个维度(展示用) */
const SPREAD_DIMENSIONS = [
  { k: "牌数", v: "决定信息量:1–3 张快速聚焦,4–7 张结构化分析,10 张以上全景深入" },
  { k: "结构", v: "牌位排列决定视角:时间流(过去/现在/未来)、十字(阻碍/根源/解法)、环形(多维度环绕)、宫位图(按人生领域分布)" },
  { k: "适用", v: "是非题选小牌阵(圣三角/钻石);两难用二择一;爱情有专测;看运势选七行星/出生宫位;没有具体问题时用所罗门之星" },
  { k: "深度", v: "牌越少越依赖单张直觉,牌越多越系统全面,解读也越复杂" }
];

function SpreadsView() {
  const [selected, setSelected] = useState<ClassicSpread | null>(null);
  return (
    <div>
      <p className="text-[11px] text-gold/40 tracking-wider mb-3">摘自《塔罗牌经典牌阵合辑》《牌阵》《塔罗入门经典牌阵》 · 点击查看牌位详解</p>

      {/* 牌阵对比:区别四维度 + 对比表 */}
      <div className="mb-6">
        <h3 className="text-goldlt tracking-[0.3em] text-sm mt-2 mb-2">✦ 牌阵对比 ✦</h3>
        <p className="text-[11px] text-gold/40 tracking-wider mb-3">不同牌阵的区别,看四个维度 —— 选对牌阵,答案才问得准</p>
        <div className="flex flex-col gap-2 mb-4">
          {SPREAD_DIMENSIONS.map(d => (
            <div key={d.k} className="flex gap-3 text-xs leading-relaxed">
              <span className="text-gold shrink-0 w-8">{d.k}</span>
              <span className="text-gold/75">{d.v}</span>
            </div>
          ))}
        </div>
        <div className="border border-gold/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-ink/60">
                  <th className="text-left px-3 py-2 text-gold text-[11px] tracking-widest whitespace-nowrap">牌阵</th>
                  <th className="px-3 py-2 text-gold text-[11px] tracking-widest whitespace-nowrap">牌数</th>
                  <th className="text-left px-3 py-2 text-gold text-[11px] tracking-widest">适合场景</th>
                  <th className="text-left px-3 py-2 text-gold text-[11px] tracking-widest">结构特点</th>
                </tr>
              </thead>
              <tbody>
                {CLASSIC_SPREADS.map(s => (
                  <tr key={s.id} className="border-t border-gold/10 align-top">
                    <td className="px-3 py-2 text-goldlt whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2 text-center text-gold/70 whitespace-nowrap">{s.cardCount}</td>
                    <td className="px-3 py-2 text-gold/80 leading-relaxed">{s.scope}</td>
                    <td className="px-3 py-2 text-gold/60 leading-relaxed">{SPREAD_NOTES[s.id] ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CLASSIC_SPREADS.map(s => (
          <motion.button key={s.id} whileHover={{ y: -2 }}
            onClick={() => setSelected(s)}
            className="text-left border border-gold/25 rounded-xl bg-ink/40 p-4 hover:border-gold/60 hover:bg-gold/5 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-goldlt tracking-widest text-sm">✦ {s.name}</span>
              <span className="text-[10px] border border-gold/30 rounded-full px-2 py-0.5 text-gold/70 shrink-0">{s.cardCount} 张</span>
            </div>
            <p className="text-xs opacity-70 mt-2 leading-relaxed">适用范围:{s.scope}</p>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected && <SpreadModal spread={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 四元素 / 宫廷牌                                                      */
/* ------------------------------------------------------------------ */

function ElementsView() {
  return (
    <div>
      <ArticleView articles={ELEMENTS} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {ELEMENT_CARDS.map(el => (
          <div key={el.id} className="border border-gold/25 rounded-xl bg-ink/40 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{el.id === "fire" ? "🔥" : el.id === "water" ? "💧" : el.id === "air" ? "🌬️" : "🪨"}</span>
              <div>
                <div className="text-goldlt tracking-widest">{el.name}元素</div>
                <div className="text-[11px] text-gold/60 tracking-wider mt-0.5">
                  {el.suit}牌组 · {el.polarity}{el.season ? ` · ${el.season}` : ""}{el.color ? ` · ${el.color}` : ""}
                </div>
              </div>
            </div>
            <p className="text-xs text-gold/80 mt-2">特质:{el.nature}</p>
            <p className="text-xs opacity-75 leading-relaxed mt-2">{el.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const COURT_RANKS = [
  { rank: "国王", trait: "主动外向,经由个人力量影响世界;组牌正面特质的外向表达" },
  { rank: "王后", trait: "表达该组来自内在的特质,不强行设定情绪基调" },
  { rank: "骑士", trait: "极端主义者,把组牌特质表达至极限;正面或负面取决于环境" },
  { rank: "侍从", trait: "像握着组牌特征的好奇小孩,鼓励「动手去做」" }
];

const COURT_SUITS = [
  { suit: "权杖", element: "火", trait: "创造、行动、热情" },
  { suit: "圣杯", element: "水", trait: "情感、直觉、关系" },
  { suit: "宝剑", element: "风", trait: "思想、理性、沟通" },
  { suit: "星币", element: "土", trait: "物质、实践、安全" }
];

function CourtView() {
  return (
    <div>
      <ArticleView articles={COURT} />
      <div className="mt-4 border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] text-center text-[11px] tracking-widest border-b border-gold/15">
          <div className="py-2 text-gold/60">组 \ 阶级</div>
          {COURT_RANKS.map(r => <div key={r.rank} className="py-2 text-goldlt">{r.rank}</div>)}
        </div>
        {COURT_SUITS.map(s => (
          <div key={s.suit} className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] text-center text-xs border-b border-gold/10 last:border-0">
            <div className="py-2.5 text-gold">
              {s.suit}<span className="block text-[10px] opacity-60">{s.element} · {s.trait}</span>
            </div>
            {COURT_RANKS.map(r => (
              <div key={r.rank} className="py-2.5 opacity-75 border-l border-gold/10 px-1 leading-relaxed">
                {s.suit}{r.rank}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gold/40 tracking-wider mt-2">组合即「牌组特质 × 阶级特质」,如权杖国王 = 权杖的创造力量 × 国王的外向表达。</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 页面主体                                                            */
/* ------------------------------------------------------------------ */

export default function KnowledgePage({ onBack }: { onBack: () => void }) {
  const [cat, setCat] = useState("basics");

  const render = () => {
    switch (cat) {
      case "basics": return <ArticleView articles={BASICS} />;
      case "reversed": return <ArticleView articles={REVERSED} />;
      case "elements": return <ElementsView />;
      case "court": return <CourtView />;
      case "tips": return <ArticleView articles={TIPS} />;
      case "faq": return <FaqView />;
      case "meanings": return <MeaningsView />;
      case "spreads": return <SpreadsView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 mb-6">← 返回</button>

      <div className="text-center mb-8">
        <h2 className="text-goldlt tracking-[0.5em] title-glow text-xl">塔罗知识</h2>
        <p className="text-gold/40 text-[11px] tracking-[0.3em] mt-2">星光收藏的智慧 · 摘自塔罗经典资料</p>
      </div>

      {/* 分类导航:宽屏侧栏,窄屏横向滚动(w-full 约束宽度,确保 overflow-x-auto 真正可滚)。
          注意:必须显式 flex-col —— Tailwind 的 flex 只设 display:flex,默认方向是 row;
          若写成 flex lg:flex-row,移动端会保持横向,导致 nav(w-full shrink-0)占满整行、
          main(flex-1 min-w-0)被挤成 0 宽,内容文字全部被裁掉不可见 */}
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="w-full lg:w-44 shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:pb-0 lg:sticky lg:top-6 w-full max-w-full">
            {KNOWLEDGE_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`shrink-0 text-left rounded-xl border px-3 py-2.5 transition-all active:scale-95 ${
                  cat === c.id
                    ? "border-gold text-goldlt bg-ink/60 shadow-[0_0_16px_rgba(212,175,55,0.2)]"
                    : "border-gold/25 opacity-50 hover:opacity-90 bg-ink/30"}`}>
                <div className="text-xs tracking-widest whitespace-nowrap">{c.icon} {c.label}</div>
                <div className="hidden lg:block text-[10px] opacity-60 mt-1 leading-relaxed">{c.blurb}</div>
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {/* 内容区:不用淡入动画,避免内容卡在 opacity:0 不可见 */}
          <div key={cat} className="w-full">
            {render()}
          </div>
        </main>
      </div>
    </div>
  );
}
