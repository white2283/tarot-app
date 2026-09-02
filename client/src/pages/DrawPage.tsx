import { useEffect, useState } from "react";
import FanDeck from "../components/FanDeck";
import CardWall from "../components/CardWall";
import { createDeck, draw } from "../../../shared/core/deck";
import { getSpread } from "../../../shared/core/spreads";
import type { Domain, DrawnCard } from "../../../shared/core/types";
import { getDeck } from "../decks";

interface Props {
  deckId: string;
  spreadId: string;
  onDone: (question: string, domain: Domain, drawn: DrawnCard[]) => void;
  onBack?: () => void;
}

export default function DrawPage({ deckId, spreadId, onDone, onBack }: Props) {
  const spread = getSpread(spreadId)!;
  const deckData = getDeck(deckId);
  const [question, setQuestion] = useState("");
  const [domain, setDomain] = useState<Domain>("general");
  const [stage, setStage] = useState<"ask" | "draw">("ask");
  const [pickedCount, setPickedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const h = () => setIsMobile(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  if (stage === "ask") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
        {onBack && (
          <button onClick={onBack} className="fixed top-6 left-6 text-sm opacity-60 hover:opacity-100">← 返回首页</button>
        )}
        <div className="text-goldlt tracking-widest text-xl">{spread.name} · {spread.cardCount} 张</div>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="默念后写下你的问题(也可留白)"
          className="w-full max-w-md h-28 bg-ink/60 border border-gold/40 rounded-xl p-4 text-goldlt placeholder:opacity-40 outline-none transition-shadow focus:border-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
        <div className="flex gap-4">
          {(["general", "love"] as Domain[]).map(d => (
            <button key={d} onClick={() => setDomain(d)}
              className={`px-6 py-2 rounded-full border tracking-widest transition-all ${
                domain === d
                  ? "border-gold text-goldlt shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  : "border-gold/30 opacity-50"
              }`}>
              {d === "general" ? "综合" : "爱情"}
            </button>
          ))}
        </div>
        <button onClick={() => setStage("draw")}
          className="px-10 py-3 border border-gold rounded-full text-goldlt tracking-[0.3em] hover:bg-gold/10">
          开始洗牌
        </button>
      </div>
    );
  }
  const handleComplete = () => {
    // 点选是仪式感的载体;发牌随机性由 draw() 保证(每张物理意义独立随机)
    const deck = createDeck(deckData);
    const drawn = draw(deck, spread.cardCount);
    onDone(question, domain, drawn);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center px-6 ${isMobile ? "pt-20 justify-start" : "justify-center"}`}>
      {onBack && (
        <button onClick={onBack} className="fixed top-6 left-6 text-sm opacity-60 hover:opacity-100 z-10">← 返回首页</button>
      )}
      <p className="text-sm opacity-60 tracking-widest mb-3">
        {isMobile ? "滑动浏览牌墙,凭直觉点选" : "凭直觉,依次选出"} {spread.cardCount} 张牌
      </p>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2" aria-label={`已选 ${pickedCount} / ${spread.cardCount}`}>
          {Array.from({ length: spread.cardCount }, (_, i) => (
            <div key={i}
              className={`w-2.5 h-2.5 rounded-full border border-gold transition-all ${
                i < pickedCount ? "bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "bg-transparent opacity-50"
              }`} />
          ))}
        </div>
        <span className="text-xs opacity-60 tracking-widest">已选 {pickedCount} / {spread.cardCount}</span>
      </div>
      {isMobile
        ? <CardWall total={deckData.cards.length} pickCount={spread.cardCount}
            onPickChange={setPickedCount} onComplete={handleComplete} />
        : <FanDeck total={deckData.cards.length} pickCount={spread.cardCount}
            onPickChange={setPickedCount} onComplete={handleComplete} />}
    </div>
  );
}
