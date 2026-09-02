import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import CardBack from "./CardBack";

interface Props { total: number; pickCount: number; onComplete: (indexes: number[]) => void; onPickChange?: (n: number) => void; }

export default function FanDeck({ total, pickCount, onComplete, onPickChange }: Props) {
  const [picked, setPicked] = useState<number[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const h = () => setIsMobile(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  // 扇形参数:以底部中心为圆心展开(手机收窄牌尺寸但保持展开弧度)
  const fanAngle = 100;
  const angles = useMemo(() => {
    return Array.from({ length: total }, (_, i) => -fanAngle / 2 + (fanAngle * i) / (total - 1));
  }, [total]);
  const cardCls = "w-16 h-28";
  const deckCls = isMobile ? "w-20 h-32" : "w-24 h-40";

  // 状态驱动副作用:函数式 setState 避免连点读旧值;计数回调与完成回调由 picked 变化触发
  useEffect(() => {
    onPickChange?.(picked.length);
    if (picked.length === pickCount && pickCount > 0) {
      timer.current = setTimeout(() => onComplete(picked), 400);
    }
  }, [picked]);

  const pick = (i: number) => {
    setPicked(prev => (prev.length >= pickCount || prev.includes(i)) ? prev : [...prev, i]);
  };

  return (
    <div className={`relative w-full overflow-hidden ${isMobile ? "h-[360px]" : "h-[420px]"}`}>
      {!shuffled && (
        <div className={`absolute left-1/2 bottom-0 -translate-x-1/2 ${deckCls}`}>
          {/* 下半叠 */}
          <motion.div className="absolute inset-0"
            animate={{ x: [0, 18, 18, 0, -14, -14, 0], y: [0, 8, 8, 0, 6, 6, 0] }}
            transition={{ duration: 2.1, times: [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1], ease: "easeInOut" }}>
            <div className="absolute inset-0 translate-x-1 translate-y-1 rotate-1"><CardBack /></div>
            <div className="absolute inset-0"><CardBack /></div>
          </motion.div>
          {/* 上半叠:两次"挑起→换位→放下"(主时间线,完成后进入扇形) */}
          <motion.div className="absolute inset-0"
            animate={{
              x: [0, -72, -72, 0, 64, 64, 0],
              y: [0, -56, -56, 0, -44, -44, 0],
              rotate: [0, -10, -10, 0, 8, 8, 0]
            }}
            transition={{ duration: 2.1, times: [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1], ease: "easeInOut" }}
            onAnimationComplete={() => setShuffled(true)}>
            <div className="absolute inset-0 -translate-x-1 -translate-y-1 -rotate-1"><CardBack /></div>
            <div className="absolute inset-0"><CardBack /></div>
          </motion.div>
          {/* 两次合拢时的金光脉冲 */}
          <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0 rgba(212,175,55,0)", "0 0 0 rgba(212,175,55,0)",
                "0 0 34px rgba(212,175,55,0.55)", "0 0 0 rgba(212,175,55,0)",
                "0 0 30px rgba(212,175,55,0.5)", "0 0 0 rgba(212,175,55,0)"
              ]
            }}
            transition={{ duration: 2.1, times: [0, 0.34, 0.5, 0.66, 0.82, 1] }} />
          <div className="absolute -top-8 left-0 right-0 text-center text-xs opacity-60 whitespace-nowrap">洗牌中…</div>
        </div>
      )}
      {shuffled && angles.map((a, i) => (
        <motion.div key={i}
          className={`absolute left-1/2 bottom-[-40px] origin-bottom ${cardCls}`}
          initial={{ rotate: 0, opacity: 0 }}
          animate={{ rotate: a, opacity: 1, y: picked.includes(i) ? -30 : 0 }}
          transition={{ delay: (1 - Math.abs(a) / 50) * 0.3, type: "spring", stiffness: 120 }}
          whileHover={{ y: -24 }}>
          <button type="button" aria-label={`第 ${i + 1} 张牌`} onClick={() => pick(i)}
            className="block w-full h-full cursor-pointer bg-transparent border-0 p-0">
            <CardBack />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
