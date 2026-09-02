import { motion } from "framer-motion";
import { SPREADS } from "../../../shared/core/spreads";
import { SPREAD_LAYOUTS } from "../../../shared/core/layouts";
import type { Spread } from "../../../shared/core/types";

/** 牌阵迷你布局示意:48×48 SVG,按 SPREAD_LAYOUTS 百分比摆小圆角矩形 */
function SpreadThumbnail({ spreadId }: { spreadId: string }) {
  const layout = SPREAD_LAYOUTS[spreadId] ?? [];
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12" aria-hidden="true">
      {layout.map((p, i) => (
        <rect key={i}
          x={p.x - 3} y={p.y - 4.5} width="6" height="9" rx="1.5"
          fill="rgba(212,175,55,0.12)" stroke="#d4af37" strokeWidth="2"
          transform={p.rotate ? `rotate(${p.rotate} ${p.x} ${p.y})` : undefined} />
      ))}
    </svg>
  );
}

/** 牌阵区别速览:按牌数分组,选牌时一眼看懂差异 */
function SpreadGuide({ spreads }: { spreads: Spread[] }) {
  const quick = spreads.filter(s => s.cardCount <= 3);
  const mid = spreads.filter(s => s.cardCount > 3 && s.cardCount <= 5);
  const deep = spreads.filter(s => s.cardCount >= 8);
  return (
    <div className="w-full max-w-6xl mx-auto mb-4 text-[11px] text-gold/55 leading-relaxed">
      <div className="text-gold/80 tracking-widest mb-1.5">💡 牌阵区别速览</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {quick.length > 0 && (
          <span>🔍 快速聚焦({quick.map(s => s.cardCount).join("/")} 张):{quick.map(s => s.name).join("、")}</span>
        )}
        {mid.length > 0 && (
          <span>⚖️ 问题结构(4–5 张):{mid.map(s => s.name).join("、")}</span>
        )}
        {deep.length > 0 && (
          <span>🌌 全景深入(≥8 张):{deep.map(s => s.name).join("、")}</span>
        )}
      </div>
      <div className="mt-1 opacity-70">牌越少越聚焦直觉,牌越多越系统全面;有具体疑问选小牌阵,想全面了解选大牌阵。</div>
    </div>
  );
}

export default function SpreadPicker({ onSelect, spreads = SPREADS, compact = false }: { onSelect: (id: string) => void; spreads?: Spread[]; compact?: boolean }) {
  if (compact) {
    return (
      <div>
        <SpreadGuide spreads={spreads} />
        <div className={`grid gap-3 mx-auto ${
          spreads.length > 4
            ? "grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
            : "grid-cols-1 min-[480px]:grid-cols-3"
        } max-w-6xl`}>
        {spreads.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 + i * 0.05, duration: 0.35 }}>
            <button onClick={() => onSelect(s.id)} title={s.description}
              className="group relative w-full border border-gold/40 rounded-xl px-3 py-3 text-center transition-all bg-ink/60 hover:border-gold hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] overflow-hidden">
              <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden" aria-hidden="true">
                <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent -skew-x-12 transition-transform duration-700 group-hover:translate-x-[300%]" />
              </span>
              <div className="flex justify-center opacity-50 group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.6)] transition-all">
                <SpreadThumbnail spreadId={s.id} />
              </div>
              <div className="text-goldlt text-sm tracking-widest mt-1.5">{s.name}</div>
              <div className="text-[10px] opacity-40 mt-0.5">{s.cardCount} 张</div>
            </button>
          </motion.div>
        ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <SpreadGuide spreads={spreads} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {spreads.map((s, i) => (
        <motion.div key={s.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}>
          <button onClick={() => onSelect(s.id)}
            className="group relative w-full h-full border border-gold/40 rounded-xl p-5 text-left transition-all bg-ink/60 hover:border-gold hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] overflow-hidden">
            <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden" aria-hidden="true">
              <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent -skew-x-12 transition-transform duration-700 group-hover:translate-x-[300%]" />
            </span>
            <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.6)] transition-all">
              <SpreadThumbnail spreadId={s.id} />
            </div>
            <div className="text-goldlt text-lg tracking-widest pr-14">{s.name}</div>
            <div className="text-sm opacity-60 mt-2">{s.description}</div>
            <div className="text-xs opacity-40 mt-3">{s.cardCount} 张牌</div>
          </button>
        </motion.div>
      ))}
      </div>
    </div>
  );
}
