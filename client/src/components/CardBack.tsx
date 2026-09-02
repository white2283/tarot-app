const GOLD = "#d4af37";
const LT = "#e9cf7a";

export default function CardBack() {
  return (
    <svg viewBox="0 0 240 420" className="w-full h-full">
      <defs>
        <radialGradient id="backbg" cx="50%" cy="32%" r="85%">
          <stop offset="0%" stopColor="#2b1a4d" />
          <stop offset="100%" stopColor="#0e0720" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="238" height="418" rx="16" fill="url(#backbg)" stroke={GOLD} strokeWidth="2" />
      <rect x="9" y="9" width="222" height="402" rx="11" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.45" />
      <circle cx="120" cy="210" r="72" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="120" cy="210" r="54" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <rect x="84" y="174" width="72" height="72" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <rect x="84" y="174" width="72" height="72" fill="none" stroke={GOLD} strokeWidth="1.6" transform="rotate(45 120 210)" />
      <circle cx="120" cy="210" r="14" fill="none" stroke={LT} strokeWidth="1.6" />
      <circle cx="120" cy="210" r="4" fill={LT} />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * Math.PI * 2) / 36;
        return <line key={i} x1={120 + 80 * Math.cos(a)} y1={210 + 80 * Math.sin(a)}
                     x2={120 + 88 * Math.cos(a)} y2={210 + 88 * Math.sin(a)} stroke={GOLD} strokeWidth="1.4" />;
      })}
      <path d="M124 83 A12 12 0 1 0 124 105 A9 9 0 1 1 124 83 Z" fill={GOLD} opacity="0.9" />
      <circle cx="120" cy="330" r="10" fill="none" stroke={GOLD} strokeWidth="1.6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI * 2) / 12;
        return <line key={i} x1={120 + 14 * Math.cos(a)} y1={330 + 14 * Math.sin(a)}
                     x2={120 + 21 * Math.cos(a)} y2={330 + 21 * Math.sin(a)} stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />;
      })}
    </svg>
  );
}
