import { motion } from "framer-motion";
import { useState } from "react";
import CardFace from "./CardFace";
import CardBack from "./CardBack";
import type { DrawnCard } from "../../../shared/core/types";

const SHADOW_OFF = "0 0 0 rgba(212,175,55,0)";

export default function FlipCard({ drawn, onFlipped }: { drawn: DrawnCard; onFlipped?: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [settled, setSettled] = useState(false);
  return (
    <motion.div className="w-[68px] h-[120px] sm:w-24 sm:h-40 cursor-pointer rounded-md"
      style={{ perspective: 800 }}
      initial={{ boxShadow: SHADOW_OFF }}
      animate={pulse
        ? { boxShadow: [SHADOW_OFF, "0 0 28px rgba(212,175,55,0.5)", SHADOW_OFF] }
        : { boxShadow: SHADOW_OFF }}
      transition={{ duration: 0.8 }}
      onClick={() => { if (!flipped) { setFlipped(true); onFlipped?.(); } }}>
      {settled ? (
        // 翻牌完成后渲染静态牌面:3D 变换层在 Chromium 会持续以低分辨率纹理缓存,静态化后恢复锐利
        <div className="w-full h-full">
          <CardFace card={drawn.card} reversed={drawn.reversed} />
        </div>
      ) : (
        <motion.div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }}
          onAnimationComplete={() => { if (flipped && !pulse) setPulse(true); if (flipped) setSettled(true); }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}><CardBack /></div>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <CardFace card={drawn.card} reversed={drawn.reversed} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
