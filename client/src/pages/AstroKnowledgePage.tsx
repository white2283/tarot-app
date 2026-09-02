import { useState } from "react";
import { HOUSE_CORE } from "../astro/houseGuide";
import { ASPECT_TYPES, PAIR_KEYWORDS } from "../astro/aspectGuide";
import { SIGN_CARDS, PLANET_CARDS } from "../astro/astroKnowledge";

const CATS = [
  { id: "houses", label: "十二宫位", icon: "🏠", blurb: "《人生的十二个面向》每宫核心意义" },
  { id: "aspects", label: "相位详解", icon: "🔀", blurb: "《顺逆皆宜的人生》九种相位与行星组合" },
  { id: "signs", label: "十二星座", icon: "✨", blurb: "《当代占星研究》星座特质速览" },
  { id: "planets", label: "行星通论", icon: "🪐", blurb: "《当代占星研究》十大行星的主题" }
] as const;

/** 按需加载并展示某个主题的原文全章 */
function OriginalText({ file, label }: { file: string; label: string }) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const load = async () => {
    if (text !== null) return;
    try {
      const r = await fetch(`/books/original/${file}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setText(await r.text());
    } catch {
      setErr("原文加载失败,请稍后再试");
    }
  };
  return (
    <div className="mt-2">
      <button onClick={() => { setOpen(v => !v); if (text === null) load(); }}
        className="text-xs text-gold/70 hover:text-gold tracking-widest">
        {open ? "收起原文 ▲" : `📖 原文全章 · ${label}`}
      </button>
      {open && (
        <div className="mt-2 border border-gold/20 rounded-lg bg-ink/50 px-4 py-3 max-h-[50vh] overflow-y-auto">
          {err && <p className="text-xs text-red-400/80">{err}</p>}
          {!err && text === null && <p className="text-xs opacity-60">加载中…</p>}
          {!err && text !== null && (
            <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-90">{text}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** 相位名 → 原文文件名(书中章节名) */
const ASPECT_SRC: Record<string, string> = {
  "合": "相位-合相.txt",
  "半六合": "相位-半六分相.txt",
  "半刑": "相位-半四分相与八分之三相.txt",
  "六合": "相位-六分相.txt",
  "刑": "相位-四分相.txt",
  "拱": "相位-三分相.txt",
  "八分之三": "相位-半四分相与八分之三相.txt",
  "十二分之五相": "相位-十二分之五相.txt",
  "冲": "相位-对分相.txt"
};

/** 行星组合章节原文 */
const PAIR_CHAPTERS = [
  { file: "相位组合-太阳的相位.txt", label: "第六章 太阳的相位" },
  { file: "相位组合-月亮的相位.txt", label: "第七章 月亮的相位" },
  { file: "相位组合-水星的相位.txt", label: "第八章 水星的相位" },
  { file: "相位组合-金星的相位.txt", label: "第九章 金星的相位" },
  { file: "相位组合-火星的相位.txt", label: "第十章 火星的相位" },
  { file: "相位组合-木星的相位.txt", label: "第十一章 木星的相位" },
  { file: "相位组合-土星的相位.txt", label: "第十二章 土星的相位" }
] as const;

/** 宫位 */
function HousesView() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-gold/40 tracking-wider">摘自《人生的十二个面向》(霍华德·萨司波塔斯)——掌握每宫的核心原则,才能理解它看似无关的传统主题。</p>
      {HOUSE_CORE.map((h, i) => (
        <div key={i} className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
          <button onClick={() => setOpen(v => (v === i ? null : i))}
            className="w-full text-left px-5 py-3.5 hover:bg-gold/5 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <span className="text-goldlt text-sm tracking-wider">第 {i + 1} 宫 · {h.kw}</span>
              <span className="text-gold/50 shrink-0 text-xs">{open === i ? "收起 ▲" : "展开 ▼"}</span>
            </div>
          </button>
          {open === i && (
            <div className="px-5 pb-4 border-t border-gold/15">
              <p className="text-sm leading-loose opacity-90 mt-3">{h.core}</p>
              <p className="text-sm leading-loose opacity-70 mt-2">{h.detail}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** 相位 */
function AspectsView() {
  const [open, setOpen] = useState<number | null>(0);
  const kindLabel = (k: string) => k === "hard" ? "困难相位" : k === "soft" ? "柔和相位" : "中性";
  const kindCls = (k: string) => k === "hard" ? "text-red-300/80 border-red-300/30" : k === "soft" ? "text-emerald-300/80 border-emerald-300/30" : "text-gold/80 border-gold/30";
  return (
    <div>
      <p className="text-[11px] text-gold/40 tracking-wider mb-3">摘自《顺逆皆宜的人生》(苏·汤普金斯)——相位是星图能量互动的语言。</p>
      <div className="flex flex-col gap-3">
        {ASPECT_TYPES.map((a, i) => (
          <div key={a.angle} className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
            <button onClick={() => setOpen(v => (v === i ? null : i))}
              className="w-full text-left px-5 py-3.5 hover:bg-gold/5 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-goldlt text-sm tracking-wider">{a.name}相</span>
                  <span className="text-[10px] text-gold/50 border border-gold/20 rounded-full px-2 py-0.5">{a.angle}°</span>
                  <span className={`text-[10px] border rounded-full px-2 py-0.5 ${kindCls(a.kind)}`}>{kindLabel(a.kind)}</span>
                </div>
                <span className="text-gold/50 shrink-0 text-xs">{open === i ? "收起 ▲" : "展开 ▼"}</span>
              </div>
              <div className="text-xs text-gold/70 mt-1">{a.essence}</div>
            </button>
            {open === i && (
              <div className="px-5 pb-4 border-t border-gold/15">
                <p className="text-sm leading-loose opacity-90 mt-3">{a.detail}</p>
                <OriginalText file={ASPECT_SRC[a.name]} label={`${a.name}相 全章`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-goldlt tracking-[0.3em] text-sm mt-6 mb-3">✦ 行星组合课题 ✦</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {Object.entries(PAIR_KEYWORDS).map(([key, kws]) => {
          const [a, b] = key.split("-");
          const nm = (k: string) => ({ sun: "太阳", moon: "月亮", mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星" } as Record<string, string>)[k] ?? k;
          return (
            <div key={key} className="border border-gold/20 rounded-lg bg-ink/40 px-3 py-2.5">
              <div className="text-xs text-gold tracking-widest">{nm(a)} — {nm(b)}</div>
              <div className="text-[11px] text-gold/70 mt-1 leading-relaxed">{kws.join("、")}</div>
            </div>
          );
        })}
      </div>

      <h3 className="text-goldlt tracking-[0.3em] text-sm mt-6 mb-3">✦ 行星组合原文(第二部) ✦</h3>
      <div className="flex flex-col gap-2">
        {PAIR_CHAPTERS.map(c => (
          <div key={c.file} className="border border-gold/20 rounded-lg bg-ink/40 px-4 py-2.5">
            <OriginalText file={c.file} label={c.label} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 星座 */
function SignsView() {
  const elCls = (e: string) => e === "火" ? "text-red-300/80" : e === "土" ? "text-emerald-300/80" : e === "风" ? "text-sky-300/80" : "text-blue-300/80";
  return (
    <div>
      <p className="text-[11px] text-gold/40 tracking-wider mb-3">摘自《当代占星研究》(苏·汤普金斯)——星座代表十二种人性的本质或人生观。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SIGN_CARDS.map(s => (
          <div key={s.name} className="border border-gold/25 rounded-xl bg-ink/40 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-goldlt tracking-widest text-sm">{s.name}</span>
              <span className={`text-[10px] ${elCls(s.element)}`}>{s.element}象</span>
              <span className="text-[10px] text-gold/50">{s.mode}星座 · 主宰:{s.ruler}</span>
            </div>
            <p className="text-xs text-gold/80 mt-2">{s.essence}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {s.traits.map(t => (
                <span key={t} className="text-[10px] border border-gold/25 rounded-full px-2 py-0.5 text-gold/70">{t}</span>
              ))}
            </div>
            <OriginalText file={`星座-${s.name}.txt`} label={`${s.name} 全章`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 行星 */
function PlanetsView() {
  return (
    <div>
      <p className="text-[11px] text-gold/40 tracking-wider mb-3">摘自《当代占星研究》第四章——行星是星图中的动词,代表特定的心理动力与动机。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLANET_CARDS.map(p => (
          <div key={p.name} className="border border-gold/25 rounded-xl bg-ink/40 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl text-goldlt">{p.glyph}</span>
              <div>
                <div className="text-goldlt tracking-widest text-sm">{p.name}</div>
                <div className="text-[11px] text-gold/70 mt-0.5">{p.essence}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {p.traits.map(t => (
                <span key={t} className="text-[10px] border border-gold/25 rounded-full px-2 py-0.5 text-gold/70">{t}</span>
              ))}
            </div>
            <OriginalText file={`行星-${p.name}.txt`} label={`${p.name} 全章`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 占星知识:宫位 / 相位 / 星座 / 行星,全部来自三本 OCR 占星专著 */
export default function AstroKnowledgePage({ onBack }: { onBack: () => void }) {
  const [cat, setCat] = useState<typeof CATS[number]["id"]>("houses");
  const render = () => {
    switch (cat) {
      case "houses": return <HousesView />;
      case "aspects": return <AspectsView />;
      case "signs": return <SignsView />;
      case "planets": return <PlanetsView />;
    }
  };
  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 mb-6">← 返回</button>
      <div className="text-center mb-8">
        <h2 className="text-goldlt tracking-[0.5em] title-glow text-xl">占 星 知 识</h2>
        <p className="text-gold/40 text-[11px] tracking-[0.3em] mt-2">宫位 · 相位 · 星座 · 行星 · 源自经典占星著作</p>
      </div>
      {/* 移动端必须显式 flex-col(flex 默认方向是 row):否则 nav(w-full shrink-0)占满整行,
          main(flex-1 min-w-0)被挤成 0 宽,内容文字全部被裁掉不可见 */}
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="w-full lg:w-44 shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:pb-0 lg:sticky lg:top-6 w-full max-w-full">
            {CATS.map(c => (
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
          <div key={cat} className="w-full">{render()}</div>
        </main>
      </div>
    </div>
  );
}
