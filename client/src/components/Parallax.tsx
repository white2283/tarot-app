import { useEffect } from "react";
import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Props {
  strength?: number;
  className?: string;
  children: ReactNode;
}

/** 鼠标视差容器:内容随手丝滑偏移(仅精确指针设备启用;触屏设备禁用,避免点按触发位置跳变) */
export default function Parallax({ strength = 12, className, children }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 50, damping: 18 });
  const sy = useSpring(y, { stiffness: 50, damping: 18 });
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return; // 触屏不启用
    const handler = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * strength);
      y.set((e.clientY / window.innerHeight - 0.5) * strength);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y, strength]);
  return <motion.div className={className} style={{ x: sx, y: sy }}>{children}</motion.div>;
}
