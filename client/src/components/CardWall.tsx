import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CardBack from "./CardBack";

interface Props {
  total: number;
  pickCount: number;
  onComplete: (indexes: number[]) => void;
  onPickChange?: (n: number) => void;
}

/** 手机端牌墙:6 列牌背网格,上下滑动浏览,点选发光(替代小屏上难点的扇形) */
export default function CardWall({ total, pickCount, onComplete, onPickChange }: Props) {
  const [picked, setPicked] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // 状态驱动副作用:函数式 setState 避免连点读旧值;计数回调与完成回调由 picked 变化触发
  useEffect(() => {
    onPickChange?.(picked.length);
    if (picked.length === pickCount && pickCount > 0) {
      timer.current = setTimeout(() => onComplete(picked), 450);
    }
  }, [picked]);

  const pick = (i: number) => {
    setPicked(prev => (prev.length >= pickCount || prev.includes(i)) ? prev : [...prev, i]);
  };

  return (
    <div className="grid grid-cols-6 gap-2 w-full max-h-[52vh] overflow-y-auto pr-1 pb-2">
      {Array.from({ length: total }, (_, i) => {
        const on = picked.includes(i);
        return (
          <motion.button key={i} type="button" aria-label={`第 ${i + 1} 张牌`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: on ? 1.06 : 1 }}
            transition={{ delay: i * 0.006, duration: 0.25 }}
            onClick={() => pick(i)}
            className={`rounded-md transition-shadow ${
              on ? "ring-2 ring-goldlt shadow-[0_0_12px_rgba(212,175,55,0.55)]" : "ring-1 ring-gold/20"
            }`}>
            <CardBack />
          </motion.button>
        );
      })}
    </div>
  );
}
