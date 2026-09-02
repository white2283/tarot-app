import type { CardData, SymbolSpec } from "../../../shared/core/types";
import type { ReactNode, JSX } from "react";

const GOLD = "#d4af37";
const LT = "#e9cf7a";

function toRoman(n: number): string {
  const t: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let r = "";
  for (const [v, s] of t) while (n >= v) { r += s; n -= v; }
  return r || "0";
}

const SPARKLE = "M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z";

type Renderer = (s: SymbolSpec) => JSX.Element;
const g = (s: SymbolSpec, children: ReactNode) => (
  <g transform={`translate(${s.x * 2.4} ${s.y * 4.2})`}>{children}</g>
);

const RENDERERS: Record<string, Renderer> = {
  sun: s => g(s, <>
    <circle r="20" fill="none" stroke={LT} strokeWidth="2" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={26 * Math.cos(a)} y1={26 * Math.sin(a)} x2={35 * Math.cos(a)} y2={35 * Math.sin(a)} stroke={LT} strokeWidth="2.4" strokeLinecap="round" />;
    })}
  </>),
  moon: s => g(s, <path d="M4 -11 A12 12 0 1 0 4 11 A9 9 0 1 1 4 -11 Z" fill={GOLD} opacity="0.9" />),
  sparkle: s => g(s, <path d={SPARKLE} fill={LT} opacity="0.85" />),
  star: s => g(s, <path d={SPARKLE} fill={LT} transform="scale(1.8)" opacity="0.9" />),
  cliff: s => g(s, <>
    <path d="M-42 0 H42 L34 18 H-30 L-36 10 Z" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-12 0 L-16 18 M14 0 L10 18" stroke={GOLD} strokeWidth="1" opacity="0.4" />
  </>),
  dog: s => g(s, <path d="M-20 10 v-13 l6 -8 h16 l7 8 v10 M-4 -11 l5 -9 l5 5 M-20 -1 l-9 -8 M-14 10 v-8 M3 10 v-8" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />),
  rose: s => g(s, <>
    <circle r="6" fill="none" stroke={GOLD} strokeWidth="1.2" />
    <circle cy="-1.5" r="3" fill="none" stroke={GOLD} strokeWidth="1" />
  </>),
  figure: s => g(s, <>
    <circle cy="-16" r="7.5" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M0 -8.5 V32 M0 32 L-13 60 M0 32 L16 52 M0 0 L-21 -18 M0 0 L23 -14 L33 -36" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    <circle cx="36" cy="-43" r="6.5" fill="none" stroke={GOLD} strokeWidth="2" />
  </>),
  tower: s => g(s, <>
    <path d="M-26 76 V-26 H26 V76 M-30 -26 v-16 h12 v9 h10 v-9 h12 v9 h10 v-9 h12 v16" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <circle cy="-40" r="5.5" fill="none" stroke={GOLD} strokeWidth="2" transform="translate(0 26)" />
    <path d="M-7 76 V50 a7 7 0 0 1 14 0 V76" fill="none" stroke={GOLD} strokeWidth="2" />
  </>),
  lightning: s => g(s, <path d="M-30 -40 L6 6 L-10 10 L16 48" fill="none" stroke={LT} strokeWidth="3.5" strokeLinejoin="round" />),
  waves: s => g(s, <>
    <path d="M-70 0 q11 -9 22 0 t22 0 t22 0 t22 0" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5" />
    <path d="M-60 16 q11 -9 22 0 t22 0 t22 0" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5" />
  </>),
  chalice: s => g(s, <>
    <path d="M-17 -22 h34 c0 15 -8.5 23 -17 23 c-8.5 0 -17 -8 -17 -22 z" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M0 1 v15 M-11 16 h22" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  vine: s => g(s, <path d="M-48 -6 Q0 32 48 -6" fill="none" stroke={GOLD} strokeWidth="1.2" />),
  grapes: s => g(s, <>
    {[[-7, -8], [7, -8], [0, -1], [-7, 6], [7, 6]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3.2" fill={GOLD} opacity="0.85" />
    ))}
  </>),
  sword: s => g(s, <path d="M0 -30 V14 M-12 14 H12 M-4 22 H4 M0 14 V22" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />),
  wand: s => g(s, <path d="M-14 24 L14 -24 M14 -24 l4 -4 M10 -20 l6 2" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" />),
  pentacle: s => g(s, <>
    <circle r="16" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M0 -10 L9.5 7 H-9.5 Z M0 10 L-9.5 -7 H9.5 Z" fill="none" stroke={GOLD} strokeWidth="1.4" />
  </>),
  crown: s => g(s, <path d="M-16 8 L-16 -6 L-8 2 L0 -10 L8 2 L16 -6 L16 8 Z" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />),
  wheel: s => g(s, <>
    <circle r="18" fill="none" stroke={GOLD} strokeWidth="2" />
    <circle r="6" fill="none" stroke={GOLD} strokeWidth="1.4" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = (a * Math.PI) / 180;
      return <line key={a} x1={6 * Math.cos(r)} y1={6 * Math.sin(r)} x2={18 * Math.cos(r)} y2={18 * Math.sin(r)} stroke={GOLD} strokeWidth="1.2" />;
    })}
  </>),
  angel: s => g(s, <>
    <circle cy="-14" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M0 -8 V16 M0 -4 C-14 -16 -24 -14 -28 -4 M0 -4 C14 -16 24 -14 28 -4" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  lion: s => g(s, <>
    <circle r="12" fill="none" stroke={GOLD} strokeWidth="2" />
    <circle r="19" fill="none" stroke={GOLD} strokeWidth="4" strokeDasharray="0.1 9.84" strokeLinecap="round" />
  </>),
  pillar: s => g(s, <path d="M0 -28 V28 M-10 -28 H10 M-10 28 H10" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />),
  lantern: s => g(s, <>
    <path d="M-8 -10 H8 L10 6 V14 H-10 V6 Z" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <circle cy="4" r="3" fill={LT} opacity="0.9" />
    <path d="M-4 -10 a4 4 0 0 1 8 0" fill="none" stroke={GOLD} strokeWidth="1.4" />
  </>),
  mountain: s => g(s, <path d="M-34 16 L-12 -12 L2 2 L18 -14 L36 16" fill="none" stroke={GOLD} strokeWidth="1.4" opacity="0.6" />),
  river: s => g(s, <path d="M-40 -6 q10 -8 20 0 t20 0 t20 0 M-40 10 q10 -8 20 0 t20 0 t20 0" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5" />),
  tree: s => g(s, <>
    <path d="M0 22 V-2 M0 6 L-12 -6 M0 6 L12 -8 M0 -2 L-7 -12 M0 -2 L8 -14" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    <path d="M-12 22 H12" stroke={GOLD} strokeWidth="1.4" />
  </>),
  heart: s => g(s, <path d="M0 12 C-14 2 -16 -8 -8 -11 C-3 -13 0 -9 0 -6 C0 -9 3 -13 8 -11 C16 -8 14 2 0 12 Z" fill="none" stroke={GOLD} strokeWidth="2" />),
  cloud: s => g(s, <path d="M-18 6 a8 8 0 0 1 4 -15 a10 10 0 0 1 19 3 a7 7 0 0 1 13 5 Z" fill="none" stroke={GOLD} strokeWidth="1.6" />),
  hand: s => g(s, <path d="M-6 16 V-4 M-2 16 V-10 M2 16 V-12 M6 16 V-8 M-10 16 V2 a4 4 0 0 1 4 -6" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" />),
  key: s => g(s, <>
    <circle cx="-10" cy="-6" r="7" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M-4 -1 L12 15 M8 11 l5 -2 M11 14 l4 -2" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  throne: s => g(s, <>
    <path d="M-18 20 H18 M-14 20 V-4 H14 V20 M-14 -4 V-28 H14 V-4" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-22 20 V6 M22 20 V6 M-26 6 H-18 M18 6 H26" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  boat: s => g(s, <>
    <path d="M-26 4 Q0 20 26 4 L20 14 H-20 Z" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <path d="M0 4 V-26 M0 -26 L16 -6 M0 -26 L0 -6 H16" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  child: s => g(s, <>
    <circle cy="-11" r="5" fill="none" stroke={GOLD} strokeWidth="1.8" />
    <path d="M0 -6 V10 M0 10 L-9 24 M0 10 L10 22 M0 -2 L-12 -10 M0 -2 L13 -8" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" />
  </>),
  eagle: s => g(s, <>
    <path d="M0 4 L-30 -12 M0 4 L30 -12 M0 4 V12" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    <circle cy="-2" r="4" fill="none" stroke={GOLD} strokeWidth="1.6" />
  </>),
  bull: s => g(s, <>
    <rect x="-12" y="-8" width="24" height="22" rx="7" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M-12 -4 C-20 -8 -22 -16 -18 -24 M12 -4 C20 -8 22 -16 18 -24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  butterfly: s => g(s, <>
    <ellipse cx="-11" cy="-8" rx="8" ry="6" fill="none" stroke={GOLD} strokeWidth="1.6" transform="rotate(-20 -11 -8)" />
    <ellipse cx="11" cy="-8" rx="8" ry="6" fill="none" stroke={GOLD} strokeWidth="1.6" transform="rotate(20 11 -8)" />
    <ellipse cx="-9" cy="7" rx="6" ry="4.5" fill="none" stroke={GOLD} strokeWidth="1.6" transform="rotate(20 -9 7)" />
    <ellipse cx="9" cy="7" rx="6" ry="4.5" fill="none" stroke={GOLD} strokeWidth="1.6" transform="rotate(-20 9 7)" />
    <path d="M0 -14 V14" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  chariot: s => g(s, <>
    <rect x="-18" y="-16" width="36" height="22" rx="2" fill="none" stroke={GOLD} strokeWidth="2" />
    <circle cx="-10" cy="12" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
    <circle cx="10" cy="12" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M-18 -6 H-34 M-34 -6 l6 -4 M-34 -6 l6 4" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
  </>),
  skull: s => g(s, <>
    <circle cy="-6" r="13" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M-8 6 V14 H8 V6" fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="-5" cy="-8" r="2" fill={LT} opacity="0.9" />
    <circle cx="5" cy="-8" r="2" fill={LT} opacity="0.9" />
  </>),
  snake: s => g(s, <>
    <path d="M-16 18 C-24 6 -6 2 -8 -6 C-10 -14 6 -16 10 -24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 -24 l8 -4 l-2 9 Z" fill={GOLD} opacity="0.85" />
  </>),
  veil: s => g(s, <>
    <path d="M-26 -20 H26" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M-20 -20 q-4 12 0 22 q4 10 -2 20 M-8 -20 q-4 12 0 22 q4 10 -2 20 M8 -20 q4 12 0 22 q-4 10 2 20 M20 -20 q4 12 0 22 q-4 10 2 20" fill="none" stroke={GOLD} strokeWidth="1.6" opacity="0.8" />
  </>),
  scroll: s => g(s, <>
    <rect x="-13" y="-18" width="26" height="36" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M-17 -18 H17 M-17 18 H17" stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />
    <path d="M-7 -8 H7 M-7 0 H7 M-7 8 H7" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
  </>)
};

const FALLBACK: Renderer = s => g(s, <path d={SPARKLE} fill={GOLD} opacity="0.7" />);

export default function CardFace({ card, reversed = false }: { card: CardData; reversed?: boolean }) {
  // 韦特塔罗使用真实牌面图(client/public/cards/{id}.webp);神谕卡回退符号渲染
  if (card.arcana !== "oracle") {
    return (
      <img src={`/cards/${card.id}.webp`} alt={card.name} draggable={false}
        className="w-full h-full object-cover rounded-2xl select-none"
        style={reversed ? { transform: "rotate(180deg)" } : undefined} />
    );
  }
  const topLabel = "✦"; // 到达 SVG 渲染分支的只有神谕卡(塔罗走图片分支)
  return (
    <svg viewBox="0 0 240 420" className="w-full h-full"
         style={reversed ? { transform: "rotate(180deg)" } : undefined}>
      <defs>
        <radialGradient id={`bg-${card.id}`} cx="50%" cy="32%" r="85%">
          <stop offset="0%" stopColor="#2b1a4d" />
          <stop offset="55%" stopColor="#180d30" />
          <stop offset="100%" stopColor="#0e0720" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="238" height="418" rx="16" fill={`url(#bg-${card.id})`} stroke={GOLD} strokeWidth="2" />
      <rect x="9" y="9" width="222" height="402" rx="11" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.45" />
      <text x="120" y="46" textAnchor="middle" fill={GOLD} fontSize="15" fontFamily="serif" letterSpacing="2">{topLabel}</text>
      {card.symbols.map((s, i) => {
        const R = RENDERERS[s.type] ?? FALLBACK;
        return <g key={i}>{R(s)}</g>;
      })}
      <text x="120" y="376" textAnchor="middle" fill={LT} fontSize="21" letterSpacing="4"
            fontFamily='"Noto Serif SC","SimSun",serif'>{card.name}</text>
      <text x="120" y="396" textAnchor="middle" fill={GOLD} fontSize="8.5" letterSpacing="3.5"
            fontFamily="serif" opacity="0.8">{card.nameEn.toUpperCase()}</text>
    </svg>
  );
}
