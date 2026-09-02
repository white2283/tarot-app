import SpreadPicker from "../components/SpreadPicker";
import CardBack from "../components/CardBack";
import CardFace from "../components/CardFace";
import Parallax from "../components/Parallax";
import Astrolabe from "../components/Astrolabe";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { DECKS } from "../decks";
import { SPREADS } from "../../../shared/core/spreads";
import type { CardData } from "../../../shared/core/types";

interface Props {
  deckId: string;
  onSelectDeck: (deckId: string) => void;
  onSelect: (id: string) => void;
  onHistory: () => void;
  onKnowledge: () => void;
  onAstro: () => void;
  onAstroKnowledge: () => void;
  onExpandAstro: () => void;
}

/** 牌组卡片图标:塔罗=月,月相神谕卡=日 */
function DeckIcon({ type }: { type: "tarot" | "oracle" }) {
  if (type === "oracle") {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7">
        <circle cx="12" cy="12" r="5" fill="none" stroke="#e9cf7a" strokeWidth="1.6" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line key={i}
              x1={12 + 7.5 * Math.cos(a)} y1={12 + 7.5 * Math.sin(a)}
              x2={12 + 10.5 * Math.cos(a)} y2={12 + 10.5 * Math.sin(a)}
              stroke="#e9cf7a" strokeWidth="1.4" strokeLinecap="round" />
          );
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <circle cx="12" cy="12" r="9" fill="#d4af37" opacity="0.9" />
      <circle cx="15.5" cy="10" r="7.5" fill="#171029" />
    </svg>
  );
}

/** 四角漂浮氛围卡(仅宽屏显示):低透明缓浮动,避开三栏主区 */
const AMBIENT = [
  { id: "major-02", side: "left" as const, x: "2.5%", y: "7%", rotate: -8, delay: 0 },
  { id: "major-17", side: "left" as const, x: "2.5%", y: "80%", rotate: -4, delay: 3.1 },
  { id: "major-10", side: "right" as const, x: "2.5%", y: "7%", rotate: 7, delay: 0.8 },
  { id: "major-19", side: "right" as const, x: "2.5%", y: "80%", rotate: 5, delay: 4.0 }
];

function AmbientCards() {
  const cards = DECKS.rws.cards;
  return (
    <>
      {AMBIENT.map(a => {
        const card = cards.find(c => c.id === a.id);
        if (!card) return null;
        return (
          <motion.div key={a.id} aria-hidden="true"
            className="absolute hidden xl:block w-28 opacity-20 pointer-events-none"
            style={{
              left: a.side === "left" ? a.x : undefined,
              right: a.side === "right" ? a.x : undefined,
              top: a.y,
              rotate: a.rotate
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, delay: a.delay, repeat: Infinity, ease: "easeInOut" }}>
            <CardFace card={card} />
          </motion.div>
        );
      })}
    </>
  );
}

/** 圣坛主视觉:巨大牌面悬浮于光晕中,星环缓转,鼠标悬停 3D 倾斜 */
function HeroCard({ card }: { card: CardData }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 14 });
  const sry = useSpring(ry, { stiffness: 120, damping: 14 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.55, type: "spring", stiffness: 80, damping: 14 }}
      className="relative"
      style={{ perspective: 900 }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="absolute -inset-12 rounded-full pointer-events-none hero-halo" aria-hidden="true" />
      <svg viewBox="0 0 100 100" className="absolute -inset-10 spin-slow-rev pointer-events-none" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#d4af37" strokeWidth="0.4" opacity="0.5" strokeDasharray="1 4" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return (
            <text key={i} x={50 + 48 * Math.cos(a)} y={50 + 48 * Math.sin(a)}
              fill="#e9cf7a" fontSize="4" textAnchor="middle" dominantBaseline="middle">✦</text>
          );
        })}
      </svg>
      <motion.div
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="w-40 rounded-2xl drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
        <CardFace card={card} />
      </motion.div>
    </motion.div>
  );
}

/** 轮换神秘学语录:每 7s 淡入淡出 */
const QUOTES = [
  { text: "塔罗不预言未来,它照亮当下", from: "佚名" },
  { text: "命运洗牌,意志出牌", from: "佚名" },
  { text: "每张牌都是一面镜子,照见的是你自己", from: "塔罗谚语" },
  { text: "星性使然,非为宿命", from: "占星谚语" },
  { text: "当你准备好倾听时,答案早已在那里", from: "佚名" }
];

function MysticQuote() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % QUOTES.length), 7000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <div className="min-h-12 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p key={i}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="text-xs text-gold/50 tracking-[0.15em] text-center leading-relaxed">
          「{q.text}」<br className="hidden lg:block" />
          <span className="text-gold/30 ml-1">—— {q.from}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function HomePage({ deckId, onSelectDeck, onSelect, onHistory, onKnowledge, onAstro, onAstroKnowledge, onExpandAstro }: Props) {
  const deck = DECKS[deckId] ?? DECKS.rws;
  const spreads = deck.type === "oracle" ? SPREADS.filter(s => s.id === "daily") : SPREADS;
  const heroCard = deck.type === "oracle" ? deck.cards[0]
    : (deck.cards.find(c => c.id === "major-00") ?? deck.cards[0]);
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col items-center px-6 py-6 relative">
      <Parallax strength={22} className="absolute inset-0 pointer-events-none">
        <AmbientCards />
      </Parallax>
      {/* 背景水印:超大缓转曼陀罗(复用牌背图案) */}
      <Parallax strength={10}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[480px] opacity-[0.08] pointer-events-none -z-10 spin-slow"
          aria-hidden="true">
          <CardBack />
        </div>
      </Parallax>

      {/* 紧凑头部 */}
      <h1 className="text-2xl tracking-[0.5em] text-goldlt title-glow">
        {"星轨塔罗".split("").map((ch, i) => (
          <motion.span key={i} className="inline-block"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.14, duration: 0.5 }}>
            {ch}
          </motion.span>
        ))}
      </h1>
      <motion.p className="text-gold/50 text-xs tracking-[0.25em] mt-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }}>
        天上如此,地上亦然 · AS ABOVE, SO BELOW
      </motion.p>
      <p className="text-xs opacity-40 tracking-widest mt-1">静心,默念你的问题,然后选择一个牌阵</p>

      {/* 主区:三栏(宽屏一屏全览,窄屏堆叠) */}
      <div className="flex-1 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[190px_1fr_auto] items-center gap-6 py-4">
        {/* 左栏:牌组切换 + 历史 + 语录 */}
        <motion.div className="flex flex-wrap justify-center lg:flex-col items-center lg:items-stretch gap-3"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95, duration: 0.4 }}>
          {Object.values(DECKS).map(d => {
            const active = deckId === d.id;
            return (
              <button key={d.id} onClick={() => onSelectDeck(d.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 tracking-widest transition-all ${
                  active
                    ? "border-gold text-goldlt bg-ink/60 shadow-[0_0_18px_rgba(212,175,55,0.25)]"
                    : "border-gold/30 opacity-40 hover:opacity-80 bg-ink/40"
                }`}>
                <DeckIcon type={d.type} />
                <span className="text-[10px]">{d.name}</span>
              </button>
            );
          })}
          <button onClick={onHistory}
            className="text-xs text-gold/60 hover:text-gold tracking-widest border border-gold/20 rounded-xl px-3 py-2 hover:border-gold/50 transition-all">
            查看历史解读 →
          </button>
          <button onClick={onKnowledge}
            className="text-xs text-gold/60 hover:text-gold tracking-widest border border-gold/20 rounded-xl px-3 py-2 hover:border-gold/50 transition-all">
            ✦ 塔罗知识 ✦
          </button>
          <button onClick={onAstro}
            className="text-xs text-gold/60 hover:text-gold tracking-widest border border-gold/20 rounded-xl px-3 py-2 hover:border-gold/50 transition-all">
            ✦ 占星台 ✦
          </button>
          <button onClick={onAstroKnowledge}
            className="text-xs text-gold/60 hover:text-gold tracking-widest border border-gold/20 rounded-xl px-3 py-2 hover:border-gold/50 transition-all">
            ✦ 占星知识 ✦
          </button>
          <MysticQuote />
        </motion.div>

        {/* 中栏:圣坛主牌 */}
        <div className="flex justify-center">
          <HeroCard card={heroCard} />
        </div>

        {/* 右栏:星盘卫星(点击中心放大) */}
        <div className="flex justify-center lg:justify-end">
          <Astrolabe mini onExpand={onExpandAstro} />
        </div>
      </div>

      {/* 底部:紧凑牌阵带 */}
      <Parallax strength={-6}>
        <SpreadPicker onSelect={onSelect} spreads={spreads} compact />
      </Parallax>

      {/* 免责声明 */}
      <p className="text-[10px] text-gold/30 tracking-widest mt-4 text-center leading-relaxed">
        仅供娱乐参考 · 占卜结果不构成任何专业建议
      </p>
    </div>
  );
}
