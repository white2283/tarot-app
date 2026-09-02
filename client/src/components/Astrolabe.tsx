import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import NatalChart from "./NatalChart";
import { skyTemplate } from "../astro/skyReading";
import { requestAiReading, saveReading } from "../api/client";
import { aspectTypeByAngle, pairKeywords } from "../astro/aspectGuide";
import {
  dayNumber, sunLongitude, moonLongitude, planetLongitude,
  moonIllumination, moonPhaseName, signOf, ZODIAC,
  type PlanetKey
} from "../astro/ephemeris";

export const BODIES: { key: PlanetKey | "sun" | "moon"; ch: string; glyph: string; name: string; color: string; kw: string }[] = [
  { key: "sun", ch: "日", glyph: "☉", name: "太阳", color: "#e9cf7a", kw: "自我与意志" },
  { key: "moon", ch: "月", glyph: "☽", name: "月亮", color: "#b8c4ff", kw: "情绪与内在" },
  { key: "mercury", ch: "水", glyph: "☿", name: "水星", color: "#d4af37", kw: "思考与沟通" },
  { key: "venus", ch: "金", glyph: "♀", name: "金星", color: "#f0d8a8", kw: "爱与美" },
  { key: "mars", ch: "火", glyph: "♂", name: "火星", color: "#e08a6a", kw: "行动与欲望" },
  { key: "jupiter", ch: "木", glyph: "♃", name: "木星", color: "#d4af37", kw: "扩张与机遇" },
  { key: "saturn", ch: "土", glyph: "♄", name: "土星", color: "#c9b27a", kw: "责任与边界" },
  { key: "uranus", ch: "天", glyph: "♅", name: "天王星", color: "#9fd8d0", kw: "变革与自由" },
  { key: "neptune", ch: "海", glyph: "♆", name: "海王星", color: "#8fa8e8", kw: "梦境与直觉" }
];

const SIGN_META: { range: string; element: string; ruler: string; kw: string }[] = [
  { range: "3.21–4.19", element: "火象", ruler: "火星", kw: "开拓与直率" },
  { range: "4.20–5.20", element: "土象", ruler: "金星", kw: "稳定与感官" },
  { range: "5.21–6.21", element: "风象", ruler: "水星", kw: "好奇与沟通" },
  { range: "6.22–7.22", element: "水象", ruler: "月亮", kw: "守护与情感" },
  { range: "7.23–8.22", element: "火象", ruler: "太阳", kw: "自信与创造" },
  { range: "8.23–9.22", element: "土象", ruler: "水星", kw: "秩序与服务" },
  { range: "9.23–10.23", element: "风象", ruler: "金星", kw: "平衡与关系" },
  { range: "10.24–11.22", element: "水象", ruler: "冥王星", kw: "深刻与转化" },
  { range: "11.23–12.21", element: "火象", ruler: "木星", kw: "自由与探索" },
  { range: "12.22–1.19", element: "土象", ruler: "土星", kw: "责任与成就" },
  { range: "1.20–2.18", element: "风象", ruler: "天王星", kw: "独立与革新" },
  { range: "2.19–3.20", element: "水象", ruler: "海王星", kw: "共情与梦想" }
];

// 相位类型与容许度对齐《顺逆皆宜的人生》第三章:合/冲/刑/拱 8°,六合 4°,其余 2°
const ASPECTS = [
  { angle: 0, name: "合", color: "#e9cf7a", orb: 8, desc: "能量融合" },
  { angle: 30, name: "半六合", color: "#8fd0a8", orb: 2, desc: "轻支持" },
  { angle: 45, name: "半刑", color: "#e0a060", orb: 2, desc: "无意识张力" },
  { angle: 60, name: "六合", color: "#7ac08a", orb: 4, desc: "机会与诱使" },
  { angle: 90, name: "刑", color: "#e08a6a", orb: 8, desc: "紧张与成长" },
  { angle: 120, name: "拱", color: "#7aa8e0", orb: 8, desc: "才华与疗愈" },
  { angle: 135, name: "八分之三", color: "#e080a0", orb: 2, desc: "戏剧化显现" },
  { angle: 150, name: "十二分之五相", color: "#c0a0d0", orb: 2, desc: "磨合与成长" },
  { angle: 180, name: "冲", color: "#e06a6a", orb: 8, desc: "对立与拉扯" }
];

function lonOf(key: PlanetKey | "sun" | "moon", d: number): number {
  if (key === "sun") return sunLongitude(d);
  if (key === "moon") return moonLongitude(d);
  return planetLongitude(d, key);
}

/** 逆行判断:0.02 日后黄经倒退即为逆行(太阳月亮永不逆行) */
function isRetrograde(key: PlanetKey | "sun" | "moon", d: number): boolean {
  if (key === "sun" || key === "moon") return false;
  const l1 = lonOf(key, d);
  const l2 = lonOf(key, d + 0.02);
  return ((l2 - l1 + 540) % 360) - 180 < 0;
}

/** 黄经 → SVG 坐标(白羊 0° 在正上方,顺时针递增) */
export function pos(lon: number, r: number, c = 120) {
  const a = ((lon - 90) * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
}

/** 宫区楔形路径 */
export function sectorPath(i: number, r0: number, r1: number, c = 120) {
  const a0 = ((i * 30 - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * 30 - 90) * Math.PI) / 180;
  const p = (r: number, a: number) => `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
  return `M ${p(r0, a0)} L ${p(r1, a0)} A ${r1} ${r1} 0 0 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
}

export function findAspects(lons: number[]) {
  const out: { i: number; j: number; a: (typeof ASPECTS)[number] }[] = [];
  for (let i = 0; i < lons.length; i++) {
    for (let j = i + 1; j < lons.length; j++) {
      let diff = Math.abs(lons[i] - lons[j]) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const a of ASPECTS) {
        if (Math.abs(diff - a.angle) <= a.orb) { out.push({ i, j, a }); break; }
      }
    }
  }
  return out;
}

const fmt = (lon: number) => `${ZODIAC[signOf(lon)]}座 ${Math.floor(lon % 30)}°`;

interface Tip { x: number; y: number; node: ReactNode; }

/** 实时星盘:中文标签 + 悬停跟随详解卡 + 逆行标记 + 相位线交互 */
export default function Astrolabe({ mini = false, large = false, onExpand }: { mini?: boolean; large?: boolean; onExpand?: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const [tip, setTip] = useState<Tip | null>(null);
  const [showNatal, setShowNatal] = useState(false);
  const [skyAi, setSkyAi] = useState("");
  const [skyAiLoading, setSkyAiLoading] = useState(false);
  const [skyAiErr, setSkyAiErr] = useState("");
  const [skySaved, setSkySaved] = useState(false);
  const [skySaveErr, setSkySaveErr] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const d = dayNumber(now);
  const sunLon = sunLongitude(d);
  const moonLon = moonLongitude(d);
  const illum = moonIllumination(d);
  const phase = moonPhaseName(d);
  const lons = BODIES.map(b => lonOf(b.key, d));
  const retros = BODIES.map(b => isRetrograde(b.key, d));
  const aspects = findAspects(lons);
  const retroNames = BODIES.filter((_, i) => retros[i]).map(b => b.name);
  const skyQuestion = `此刻(${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")});月相${phase}(照亮 ${Math.round(illum * 100)}%);逆行:${retroNames.join("、") || "无"}`;
  const skyItems = [
    ...BODIES.map((b, i) => ({
      positionName: b.name,
      cardName: `${fmt(lons[i])}${retros[i] ? " 逆行" : ""}`,
      reversed: false,
      note: `守护主题:${b.kw}`
    })),
    ...aspects.slice(0, 5).map(a => ({
      positionName: "相位",
      cardName: `${BODIES[a.i].name}${a.a.name}${BODIES[a.j].name}(${a.a.desc})`,
      reversed: false,
      note: `${aspectTypeByAngle(a.a.angle)?.essence ?? a.a.desc};${aspectTypeByAngle(a.a.angle)?.detail ?? ""}`
    }))
  ];
  const saveSky = async () => {
    try {
      await saveReading({
        question: skyQuestion, deckId: "astro", spreadId: "sky",
        cards: [], aiEnhanced: Boolean(skyAi),
        interpretationText: `${skyTemplate({ sunLon, moonLon, phase, illum, retroNames, aspects: aspects.map(a => ({ a: BODIES[a.i].name, b: BODIES[a.j].name, name: a.a.name, desc: a.a.desc, essence: aspectTypeByAngle(a.a.angle)?.essence })) })}${skyAi ? `\n\n【AI 天象详解】\n${skyAi}` : ""}`
      });
      setSkySaved(true);
      setSkySaveErr(false);
    } catch {
      setSkySaveErr(true);
    }
  };

  const showTip = (e: React.MouseEvent, node: ReactNode) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left + 14, y: e.clientY - r.top - 10, node });
  };

  const planetTip = (i: number) => {
    const b = BODIES[i];
    return (
      <>
        <div className="text-goldlt text-xs mb-1">{b.glyph} {b.name}{retros[i] && <span className="text-red-300 ml-1">℞ 逆行中</span>}</div>
        <div className="text-gold/80">此刻在 {fmt(lons[i])}</div>
        <div className="text-gold/50 mt-1">守护主题:{b.kw}</div>
      </>
    );
  };

  return (
    <div ref={wrapRef}
      className={`relative border border-gold/30 rounded-2xl bg-ink/50 flex flex-col items-center gap-2.5 ${
        mini ? "px-3 py-3 cursor-pointer hover:border-gold/60 hover:shadow-[0_0_18px_rgba(212,175,55,0.2)] transition-all" : "px-5 py-4"
      } ${large ? "max-h-[85vh] overflow-y-auto overscroll-contain" : ""}`}
      onClick={mini ? onExpand : undefined}
      role={mini ? "button" : undefined}
      aria-label={mini ? "放大星盘" : undefined}>
      <div className={`text-goldlt tracking-[0.4em] ${mini ? "text-[10px]" : "text-xs"}`}>
        ✦ 此 刻 星 空 ✦{mini && <span className="ml-1 text-gold/40">↗</span>}
      </div>
      <svg viewBox="0 0 240 240" className={mini ? "w-36 h-36" : large ? "w-[420px] h-[420px] max-w-[82vw] max-h-[62vh]" : "w-64 h-64"}>
        {/* 宫区分色 */}
        {ZODIAC.map((name, i) => (
          <path key={i} d={sectorPath(i, 60, 86)}
            fill={`rgba(212,175,55,${i % 2 === 0 ? 0.05 : 0.02})`}
            className="cursor-pointer"
            onMouseMove={mini ? undefined : e => showTip(e, (
              <>
                <div className="text-goldlt text-xs mb-1">{name}座 <span className="text-gold/50">{SIGN_META[i].range}</span></div>
                <div className="text-gold/80">{SIGN_META[i].element} · 守护星:{SIGN_META[i].ruler}</div>
                <div className="text-gold/50 mt-1">关键词:{SIGN_META[i].kw}</div>
              </>
            ))}
            onMouseLeave={() => setTip(null)} />
        ))}
        {/* 相位线(带隐形加粗命中区) */}
        {!mini && aspects.map((asp, k) => {
          const p1 = pos(lons[asp.i], 52);
          const p2 = pos(lons[asp.j], 52);
          const guide = aspectTypeByAngle(asp.a.angle);
          const kws = pairKeywords(BODIES[asp.i].key, BODIES[asp.j].key);
          const content = (
            <>
              <div className="text-xs mb-1" style={{ color: asp.a.color }}>
                {BODIES[asp.i].name} {asp.a.name} {BODIES[asp.j].name}
              </div>
              {kws && <div className="text-gold/85">{kws.join("、")}</div>}
              {guide && (
                <>
                  <div className="text-gold/70 mt-1">{guide.essence} · {asp.a.desc}</div>
                  <div className="text-gold/45 mt-1 leading-relaxed">{guide.detail}</div>
                </>
              )}
            </>
          );
          return (
            <g key={k}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={asp.a.color} strokeWidth="0.9" opacity="0.45" pointerEvents="none" />
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="8" opacity="0"
                className="cursor-pointer"
                onMouseMove={e => showTip(e, content)}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}
        {/* 环与刻度 */}
        <circle cx="120" cy="120" r="112" fill="none" stroke="#d4af37" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="120" cy="120" r="86" fill="none" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="0.7" />
        <circle cx="120" cy="120" r="60" fill="none" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="0.6" />
        {Array.from({ length: 72 }, (_, i) => {
          const major = i % 6 === 0;
          const p1 = pos(i * 5, major ? 106 : 109);
          const p2 = pos(i * 5, 112);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="#d4af37" strokeOpacity={major ? 0.5 : 0.25} strokeWidth={major ? 1 : 0.5} pointerEvents="none" />;
        })}
        {/* 星座中文名 */}
        {ZODIAC.map((name, i) => {
          const p = pos(i * 30 + 15, 99);
          return (
            <text key={name} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fontSize={mini ? 9 : 10} fill="#d4af37" opacity="0.85" pointerEvents="none">{name}</text>
          );
        })}
        {/* 行星:彩点 + 中文字 */}
        {BODIES.map((b, i) => {
          const p = pos(lons[i], 74 - (i % 3) * 12);
          const r = mini ? 6.5 : large ? 11 : 9;
          return (
            <g key={b.key} className={mini ? undefined : "cursor-pointer"}
              onMouseMove={mini ? undefined : e => showTip(e, planetTip(i))}
              onMouseLeave={mini ? undefined : () => setTip(null)}>
              <circle cx={p.x} cy={p.y} r={r} fill={b.color} opacity="0.92" />
              <text x={p.x} y={p.y + 0.5} textAnchor="middle" dominantBaseline="central"
                fontSize={mini ? 6.5 : large ? 11 : 9} fill="#1a1030" fontWeight="bold" pointerEvents="none">{b.ch}</text>
              {!mini && retros[i] && (
                <text x={p.x + r + 3} y={p.y - r + 2} fontSize="7" fill="#e06a6a" pointerEvents="none">逆</text>
              )}
            </g>
          );
        })}
        <circle cx="120" cy="120" r="2" fill="#d4af37" opacity="0.6" pointerEvents="none" />
      </svg>

      {/* 悬停跟随详解卡 */}
      {!mini && tip && (
        <div className="absolute z-10 pointer-events-none border border-gold/40 rounded-lg bg-[#171029]/95 px-3 py-2 text-[11px] leading-relaxed text-left shadow-lg max-w-[260px]"
          style={{ left: tip.x, top: tip.y }}>
          {tip.node}
        </div>
      )}

      {!mini && (
        <>
          <div className="text-[11px] text-gold/55 tracking-widest text-center leading-relaxed">
            太阳在{fmt(sunLon)} · 月亮在{fmt(moonLon)}<br />
            {phase} · 照亮 {Math.round(illum * 100)}% · {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")} 实时
          </div>

          {/* 今日天象:模板解读常驻 */}
          <div className="text-[11px] text-gold/75 leading-relaxed text-center border-t border-gold/15 pt-2 max-w-[300px]">
            {skyTemplate({
              sunLon, moonLon, phase, illum,
              retroNames: BODIES.filter((_, i) => retros[i]).map(b => b.name),
              aspects: aspects.map(a => ({ a: BODIES[a.i].name, b: BODIES[a.j].name, name: a.a.name, desc: a.a.desc }))
            })}
          </div>

          {/* AI 天象详解 */}
          {!skyAi ? (
            <button disabled={skyAiLoading}
              onClick={async () => {
                setSkyAiLoading(true);
                setSkyAiErr("");
                try {
                  const text = await requestAiReading({
                    question: skyQuestion,
                    domain: "general",
                    spreadName: "今日天象",
                    mode: "sky",
                    items: skyItems
                  });
                  setSkyAi(text);
                } catch {
                  setSkyAiErr("AI 暂时不可用,请稍后再试");
                } finally {
                  setSkyAiLoading(false);
                }
              }}
              className="px-4 py-1.5 text-[11px] border border-goldlt/60 rounded-full text-goldlt tracking-[0.2em] hover:bg-gold/10 disabled:opacity-40">
              {skyAiLoading ? "解读中…" : "✨ AI 天象详解"}
            </button>
          ) : (
            <div className="border border-gold/40 rounded-xl p-3 bg-ink/60 max-w-[300px]">
              <div className="text-goldlt text-xs tracking-widest mb-1">✨ AI 今日天象</div>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-90">{skyAi}</p>
            </div>
          )}
          {skyAiErr && <p className="text-red-400/80 text-[11px]">{skyAiErr}</p>}

          {/* 保存天象解读(大尺寸模式) */}
          {large && (
            <button onClick={saveSky}
              className="px-4 py-1.5 text-[11px] border border-gold/50 rounded-full text-gold/80 tracking-[0.2em] hover:bg-gold/10 transition-all">
              {skySaved ? "已保存 ✓" : "💾 保存天象解读"}
            </button>
          )}
          {skySaveErr && <p className="text-red-400/80 text-[11px]">保存失败,请重试</p>}

          <div className="text-[10px] text-gold/35 tracking-wider text-center">
            相位线:金=合 · 绿=六合 · 橙=刑 · 蓝=拱 · 红=冲 · 「逆」=逆行中
          </div>
          <button onClick={() => setShowNatal(true)}
            className="mt-1 px-5 py-1.5 text-xs border border-gold/50 rounded-full text-goldlt tracking-[0.25em] hover:bg-gold/10 transition-all">
            ✦ 生成本命盘
          </button>
        </>
      )}
      <AnimatePresence>
        {showNatal && <NatalChart onClose={() => setShowNatal(false)} />}
      </AnimatePresence>
    </div>
  );
}
