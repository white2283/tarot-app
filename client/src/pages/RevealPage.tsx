import { useState } from "react";
import { motion } from "framer-motion";
import FlipCard from "../components/FlipCard";
import { getSpread } from "../../../shared/core/spreads";
import { templateInterpret } from "../../../shared/core/interpret";
import { SPREAD_LAYOUTS } from "../../../shared/core/layouts";
import type { Domain, DrawnCard, Interpretation } from "../../../shared/core/types";

export { SPREAD_LAYOUTS };

interface Props {
  spreadId: string; question: string; domain: Domain; drawn: DrawnCard[];
  onDone: (r: Interpretation) => void;
  onBack?: () => void;
}

export default function RevealPage({ spreadId, question, domain, drawn, onDone, onBack }: Props) {
  const spread = getSpread(spreadId)!;
  const layout = SPREAD_LAYOUTS[spreadId] ?? SPREAD_LAYOUTS["daily"];
  const [flippedCount, setFlippedCount] = useState(0);
  const allFlipped = flippedCount >= drawn.length;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10">
      {onBack && (
        <button onClick={onBack} className="fixed top-6 left-6 text-sm opacity-60 hover:opacity-100 z-10">← 返回首页</button>
      )}
      <div className={`relative w-full max-w-3xl ${spreadId === "celtic-cross" ? "h-[480px] sm:h-[560px]" : "h-[400px] sm:h-[480px]"}`}>
        {drawn.map((d, i) => (
          <div key={i} className="absolute"
            style={{ left: `${layout[i].x}%`, top: `${layout[i].y}%`, transform: "translate(-50%,-50%)" }}>
            <div style={layout[i].rotate ? { transform: `rotate(${layout[i].rotate}deg)` } : undefined}>
              <FlipCard drawn={d} onFlipped={() => setFlippedCount(c => c + 1)} />
            </div>
            <div className="text-center text-xs mt-1 opacity-60">{spread.positions[i].name}</div>
          </div>
        ))}
      </div>
      <p className="text-sm opacity-50 mt-2">{allFlipped ? "全部揭示" : "点击牌面逐张翻开"}</p>
      {allFlipped && (
        <motion.button onClick={() => onDone(templateInterpret({ question, domain, spread, drawn }))}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="mt-6 px-10 py-3 border border-gold rounded-full text-goldlt tracking-[0.3em] hover:bg-gold/10 pulse-glow">
          查看解读
        </motion.button>
      )}
    </div>
  );
}
