import { useState } from "react";
import { motion } from "framer-motion";
import CardFace from "./CardFace";
import type { Interpretation } from "../../../shared/core/types";

/** 16px 迷你曼陀罗分隔符 */
function MiniMandala() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-gold/70" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="4.5" y="4.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <rect x="4.5" y="4.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="0.8"
        transform="rotate(45 8 8)" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function PositionCard({ p, i }: { p: Interpretation["positions"][number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.08 }}
      className="border border-gold/25 rounded-xl p-5 bg-ink/40 flex gap-5">
      <div className="w-16 shrink-0 self-start">
        <CardFace card={p.drawn.card} reversed={p.drawn.reversed} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-gold text-sm tracking-widest mb-2">
          {p.position.name} · {p.drawn.card.name}{p.drawn.reversed ? "(逆位)" : ""}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {p.drawn.card.keywords.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full border border-gold/40 text-gold/80">{k}</span>
          ))}
        </div>
        <p className="leading-loose text-sm opacity-90">{p.text}</p>
        {p.drawn.card.detail && (
          <>
            <button onClick={() => setOpen(o => !o)}
              className="text-xs text-gold/70 hover:text-gold mt-3 tracking-widest">
              {open ? "收起牌意 ▲" : "深入牌意 ▾"}
            </button>
            {open && (
              <p className="leading-loose text-sm opacity-70 mt-2 border-t border-gold/15 pt-3">
                {p.drawn.card.detail}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function InterpretationView({ data }: { data: Interpretation }) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
        className="border border-gold/40 rounded-xl p-6 bg-ink/60">
        <div className="flex justify-center mb-3"><MiniMandala /></div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 border-t border-gold/40" />
          <div className="text-goldlt tracking-widest whitespace-nowrap">
            整体解读{data.source === "ai" ? " · AI 深度版" : ""}
          </div>
          <div className="flex-1 border-t border-gold/40" />
        </div>
        <p className="leading-loose whitespace-pre-wrap">{data.summary}</p>
      </motion.div>
      {data.positions.map((p, i) => <PositionCard key={i} p={p} i={i} />)}
    </div>
  );
}
