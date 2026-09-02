import { useMemo } from "react";

interface Star {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
}

/** 全屏星空背景:~60 颗随机小圆点,各自以 2–5s 周期闪烁(twinkle 定义在 index.css);另有 ~14 粒金色尘埃缓慢上升 */
export default function Starfield() {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 60 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 1.5,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 5
      })),
    []
  );
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: `${Math.random() * 100}%`,
        size: 1.5 + Math.random() * 2,
        duration: 9 + Math.random() * 8,
        delay: Math.random() * 9
      })),
    []
  );
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "#e9cf7a",
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`
          }}
        />
      ))}
      {motes.map((m, i) => (
        <div
          key={`mote-${i}`}
          className="absolute rounded-full"
          style={{
            left: m.left,
            bottom: -8,
            width: m.size,
            height: m.size,
            background: "#d4af37",
            animation: `rise ${m.duration}s linear ${m.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}
