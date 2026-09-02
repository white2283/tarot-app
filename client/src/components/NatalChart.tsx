import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  dayNumber, sunLongitude, moonLongitude, planetLongitude,
  signOf, ZODIAC, ZODIAC_GLYPHS, type PlanetKey
} from "../astro/ephemeris";
import { angles, houseOf, houseCusp } from "../astro/houses";
import { CITIES, findCity } from "../astro/cities";
import { birthUtc, cityTimeZone } from "../astro/timezones";
import { BODIES, pos, findAspects } from "./Astrolabe";
import { requestAiReading, saveReading } from "../api/client";
import { aspectInterpretation } from "../astro/aspectGuide";
import { houseCore } from "../astro/houseGuide";

const SIGN_KW = [
  "开拓直率", "稳定感官", "好奇沟通", "守护情感", "自信创造", "秩序服务",
  "平衡关系", "深刻转化", "自由探索", "责任成就", "独立革新", "共情梦想"
];

interface BirthInfo { date: string; time: string; city: string; custom?: { lat: number; lon: number } | null; }
interface ChartResult {
  asc: number; mc: number; lons: number[]; houses: number[]; aspects: ReturnType<typeof findAspects>;
}

const fmt = (lon: number) => `${ZODIAC[signOf(lon)]} ${Math.floor(lon % 30)}°`;

/** 可折叠解读分段(受控):同时只展开一个;直接渲染,不依赖高度动画(避免 iOS 上内容卡在 height:0) */
function CollapseSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="border border-gold/20 rounded-lg bg-ink/40 overflow-hidden">
      <button onClick={onToggle}
        className="w-full text-left px-4 py-2.5 hover:bg-gold/5 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gold tracking-widest">{title}</span>
          <span className="text-[10px] text-gold/50 shrink-0">{open ? "收起 ▲" : "展开 ▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-gold/15">
          {children}
        </div>
      )}
    </div>
  );
}

function computeChart(b: BirthInfo): ChartResult | null {
  // 优先用手动经纬度;否则查城市库(支持"张家口市"等带后缀写法)
  const city = findCity(b.city);
  const loc = b.custom && Number.isFinite(b.custom.lat) && Number.isFinite(b.custom.lon)
    ? { lat: b.custom.lat, lon: b.custom.lon, name: b.city }
    : city ? { lat: city.lat, lon: city.lon, name: city.name } : undefined;
  if (!loc || !b.date) return null;
  // 出生时刻 = 出生城市当地钟表时间 → 按该城市时区换算成 UTC(自动处理夏令时)
  const birth = birthUtc(b.date, b.time || "12:00", cityTimeZone(loc.name));
  if (Number.isNaN(birth.getTime())) return null;
  const d = dayNumber(birth);
  const lons = BODIES.map(x => {
    if (x.key === "sun") return sunLongitude(d);
    if (x.key === "moon") return moonLongitude(d);
    return planetLongitude(d, x.key as PlanetKey);
  });
  const { asc, mc } = angles(birth, loc.lat, loc.lon);
  // 宫位统一用等宫制(与测测等主流 App 一致):第 1 宫从上升点起算,每宫 30°
  return { asc, mc, lons, houses: lons.map(l => houseOf(l, asc)), aspects: findAspects(lons) };
}

function loadSaved(): BirthInfo | null {
  try {
    const raw = localStorage.getItem("natal_birth");
    return raw ? JSON.parse(raw) as BirthInfo : null;
  } catch { return null; }
}

/** 本命盘:输入出生日期/时间/城市,计算行星落座落宫与上升中天;inline 模式用于占星台内嵌 */
export default function NatalChart({ onClose, inline = false }: { onClose?: () => void; inline?: boolean }) {
  const [init] = useState<BirthInfo>(() => loadSaved() ?? { date: "1995-01-01", time: "12:00", city: "北京" });
  const [form, setForm] = useState<BirthInfo>(init);
  const [manualLat, setManualLat] = useState(() => (init.custom ? String(init.custom.lat) : ""));
  const [manualLon, setManualLon] = useState(() => (init.custom ? String(init.custom.lon) : ""));
  const [formErr, setFormErr] = useState("");
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [openSec, setOpenSec] = useState("core"); // 手风琴:当前展开的解读分段

  // AI 生成完成后自动展开 AI 段
  useEffect(() => {
    if (aiText) setOpenSec("ai");
  }, [aiText]);

  const saveNatal = async (f: BirthInfo) => {
    if (!chart) return;
    try {
      const text = [
        `上升${ZODIAC[signOf(chart.asc)]} —— 你给世界的第一印象偏向${SIGN_KW[signOf(chart.asc)]}`,
        `☉ 太阳在${fmt(chart.lons[0])} · 第 ${chart.houses[0]} 宫:${houseCore(chart.houses[0]).core}—— 核心自我`,
        `☽ 月亮在${fmt(chart.lons[1])} · 第 ${chart.houses[1]} 宫:${houseCore(chart.houses[1]).core}—— 内在情绪`,
        ...BODIES.slice(2).map((b, j) => {
          const i = j + 2;
          return `${b.glyph} ${b.name} · ${fmt(chart.lons[i])} · 第 ${chart.houses[i]} 宫:${houseCore(chart.houses[i]).core}`;
        }),
        ...aspectLines(),
        aiText ? `【AI 本命详解】\n${aiText}` : ""
      ].filter(Boolean).join("\n");
      await saveReading({
        question: `出生于 ${f.date} ${f.time},${f.city}${f.custom ? `(${f.custom.lat},${f.custom.lon})` : ""}`, deckId: "astro", spreadId: "natal",
        cards: [], aiEnhanced: Boolean(aiText), interpretationText: text
      });
      setSaved(true);
      setSaveErr(false);
    } catch {
      setSaveErr(true);
    }
  };

  /** 相位深度解读行(摘自《顺逆皆宜的人生》) */
  const aspectLines = () => {
    if (!chart || chart.aspects.length === 0) return [] as string[];
    return chart.aspects.slice(0, 5).map(a =>
      `相位:${BODIES[a.i].name}${a.a.name}${BODIES[a.j].name} —— ${aspectInterpretation(BODIES[a.i].key, BODIES[a.j].key, a.a.angle)}`
    );
  };

  const generate = (f: BirthInfo) => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    const ef: BirthInfo = {
      ...f,
      custom: (!findCity(f.city) && Number.isFinite(lat) && Number.isFinite(lon)) ? { lat, lon } : null
    };
    const r = computeChart(ef);
    if (r) {
      setChart(r);
      setAiText("");
      setAiErr("");
      setFormErr("");
      localStorage.setItem("natal_birth", JSON.stringify(ef));
    } else {
      setFormErr(!findCity(f.city) ? "未找到该城市,请在上方填写纬度/经度后生成" : "请填写出生日期");
    }
  };
  useEffect(() => {
    const saved = loadSaved();
    if (saved) generate(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const axis = (lon: number, r: number) => {
    const p1 = pos(lon, 0), p2 = pos(lon, r);
    const p3 = pos(lon + 180, r);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x3: p3.x, y3: p3.y };
  };
  const ascAx = chart ? axis(chart.asc, 112) : null;
  const mcAx = chart ? axis(chart.mc, 112) : null;

  const content = (
    <>
        {/* 出生信息表单 */}
        <div className="flex flex-wrap justify-center items-end gap-4 mb-6">
          <label className="flex flex-col gap-1 text-xs text-gold/60">
            出生日期
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-ink/60 border border-gold/40 rounded-lg px-3 py-2 text-goldlt text-sm focus:border-gold outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gold/60">
            出生时间
            <input type="time" value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="bg-ink/60 border border-gold/40 rounded-lg px-3 py-2 text-goldlt text-sm focus:border-gold outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gold/60">
            出生城市
            <input list="city-options" value={form.city}
              onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setFormErr(""); }}
              placeholder="输入城市名搜索(全国地级市+世界城市)"
              className="bg-ink/60 border border-gold/40 rounded-lg px-3 py-2 text-goldlt text-sm focus:border-gold outline-none w-44" />
            <datalist id="city-options">
              {CITIES.map(c => <option key={c.name} value={c.name} />)}
            </datalist>
          </label>
          <button onClick={() => generate(form)}
            className="px-6 py-2 border border-gold rounded-full text-goldlt text-sm tracking-[0.3em] hover:bg-gold/10">
            生成星盘
          </button>
        </div>

        {/* 城市未收录时:手动输入经纬度(北纬/东经为正,北京≈39.9, 116.4) */}
        {!findCity(form.city) && (
          <div className="flex flex-wrap justify-center items-end gap-4 mb-4 text-xs text-gold/60">
            <label className="flex flex-col gap-1">
              纬度(北纬为正)
              <input type="number" step="0.0001" placeholder="如 39.9042" value={manualLat}
                onChange={e => { setManualLat(e.target.value); setFormErr(""); }}
                className="bg-ink/60 border border-gold/40 rounded-lg px-3 py-2 text-goldlt text-sm focus:border-gold outline-none w-32" />
            </label>
            <label className="flex flex-col gap-1">
              经度(东经为正)
              <input type="number" step="0.0001" placeholder="如 116.4074" value={manualLon}
                onChange={e => { setManualLon(e.target.value); setFormErr(""); }}
                className="bg-ink/60 border border-gold/40 rounded-lg px-3 py-2 text-goldlt text-sm focus:border-gold outline-none w-32" />
            </label>
            <p className="w-full text-center text-[11px] opacity-50">未收录的小城/村镇可在此直接填坐标,再点「生成星盘」</p>
          </div>
        )}
        {formErr && <p className="text-center text-xs text-red-400/80 mb-3">{formErr}</p>}

        {chart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* 左列:轮盘 + 常驻操作按钮 */}
            <div className="flex flex-col items-center gap-3">
            {/* 轮盘 */}
            <svg viewBox="0 0 240 240" className="w-full max-w-[300px] mx-auto">
              <circle cx="120" cy="120" r="112" fill="none" stroke="#d4af37" strokeOpacity="0.5" strokeWidth="1" />
              <circle cx="120" cy="120" r="86" fill="none" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="0.7" />
              <circle cx="120" cy="120" r="60" fill="none" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="0.6" />
              {/* 宫位线:等宫制 12 宫头(从上升点每 30°,与测测等主流轮盘一致) */}
              {Array.from({ length: 12 }, (_, n) => {
                const a = houseCusp(n + 1, chart.asc);
                const p1 = pos(a, 86), p2 = pos(a, 112);
                return <line key={n} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#d4af37" strokeOpacity="0.3" strokeWidth="0.7" />;
              })}
              {ZODIAC_GLYPHS.map((g, i) => {
                const p = pos(i * 30 + 15, 99);
                return <text key={g} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fill="#d4af37" opacity="0.75">{g}</text>;
              })}
              {/* 宫位数字(等宫制宫头) */}
              {Array.from({ length: 12 }, (_, n) => {
                const p = pos(houseCusp(n + 1, chart.asc) + 15, 67);
                return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="#d4af37" opacity="0.5">{n + 1}</text>;
              })}
              {/* 相位线 */}
              {chart.aspects.map((a, k) => {
                const p1 = pos(chart.lons[a.i], 54), p2 = pos(chart.lons[a.j], 54);
                return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={a.a.color} strokeWidth="0.9" opacity="0.4" />;
              })}
              {/* ASC / MC 轴线 */}
              {ascAx && (
                <>
                  <line x1={ascAx.x1} y1={ascAx.y1} x2={ascAx.x2} y2={ascAx.y2} stroke="#e9cf7a" strokeWidth="1.6" />
                  <line x1={ascAx.x1} y1={ascAx.y1} x2={ascAx.x3} y2={ascAx.y3} stroke="#e9cf7a" strokeWidth="1.6" />
                  <text x={pos(chart.asc, 118).x} y={pos(chart.asc, 118).y} fontSize="7" fill="#e9cf7a" textAnchor="middle">ASC</text>
                  <text x={pos(chart.asc + 180, 118).x} y={pos(chart.asc + 180, 118).y} fontSize="7" fill="#e9cf7a" textAnchor="middle">DSC</text>
                </>
              )}
              {mcAx && (
                <>
                  <line x1={mcAx.x1} y1={mcAx.y1} x2={mcAx.x2} y2={mcAx.y2} stroke="#8fa8e8" strokeWidth="1.4" strokeDasharray="4 3" />
                  <line x1={mcAx.x1} y1={mcAx.y1} x2={mcAx.x3} y2={mcAx.y3} stroke="#8fa8e8" strokeWidth="1.4" strokeDasharray="4 3" />
                  <text x={pos(chart.mc, 118).x} y={pos(chart.mc, 118).y} fontSize="7" fill="#8fa8e8" textAnchor="middle">MC</text>
                  <text x={pos(chart.mc + 180, 118).x} y={pos(chart.mc + 180, 118).y} fontSize="7" fill="#8fa8e8" textAnchor="middle">IC</text>
                </>
              )}
              {/* 行星 */}
              {BODIES.map((b, i) => {
                const p = pos(chart.lons[i], 74 - (i % 3) * 10);
                return (
                  <text key={b.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="13" fill={b.color}>
                    {b.glyph}
                    <title>{b.name} · {fmt(chart.lons[i])} · 第 {chart.houses[i]} 宫</title>
                  </text>
                );
              })}
            </svg>

            {/* 操作按钮(常驻可见,不随文本滚动) */}
            <div className="flex flex-col items-center gap-2 w-full max-w-[300px]">
              {!aiText && (
                <button
                  disabled={aiLoading}
                  onClick={async () => {
                    setAiLoading(true);
                    setAiErr("");
                    try {
                      const text = await requestAiReading({
                        question: `出生于 ${form.date} ${form.time},${form.city};上升${ZODIAC[signOf(chart.asc)]},中天 MC 在${fmt(chart.mc)}`,
                        domain: "general",
                        spreadName: "本命星盘",
                        mode: "natal",
                        items: [
                          { positionName: "上升点(ASC)", cardName: fmt(chart.asc), reversed: false,
                            note: `第一印象:${SIGN_KW[signOf(chart.asc)]}` },
                          ...BODIES.map((b, i) => ({
                            positionName: `${b.name}·第 ${chart.houses[i]} 宫`,
                            cardName: fmt(chart.lons[i]),
                            reversed: false,
                            note: `${b.kw};星座特质:${SIGN_KW[signOf(chart.lons[i])]};宫位主题:${houseCore(chart.houses[i]).kw}(${houseCore(chart.houses[i]).core})`
                          })),
                          ...chart.aspects.slice(0, 38).map(a => ({
                            positionName: "相位",
                            cardName: `${BODIES[a.i].name}${a.a.name}${BODIES[a.j].name}(${a.a.angle}°,容许度${a.a.orb}°)`,
                            reversed: false,
                            note: aspectInterpretation(BODIES[a.i].key, BODIES[a.j].key, a.a.angle)
                          }))
                        ]
                      });
                      setAiText(text);
                    } catch {
                      setAiErr("AI 暂时不可用,请稍后再试");
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  className="px-6 py-2 border border-goldlt rounded-full text-goldlt text-sm tracking-[0.25em] hover:bg-gold/10 disabled:opacity-40">
                  {aiLoading ? "解读中…(约 1–2 分钟)" : "✨ AI 深度详解本命盘"}
                </button>
              )}
              {aiErr && <p className="text-red-400/80 text-xs">{aiErr}</p>}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button onClick={() => saveNatal(form)}
                  className="px-6 py-2 border border-gold/60 rounded-full text-gold text-sm tracking-[0.25em] hover:bg-gold/10 disabled:opacity-40">
                  {saved ? "已保存 ✓" : "💾 保存本命盘解读"}
                </button>
                {saveErr && <p className="text-red-400/80 text-xs">保存失败,请重试</p>}
              </div>
            </div>
            </div>

            {/* 右列:解读(手风琴式分段,同时只展开一个) */}
            <div className="flex flex-col gap-3">
              <CollapseSection title="✦ 上升与三巨头" open={openSec === "core"} onToggle={() => setOpenSec(v => (v === "core" ? "" : "core"))}>
                <p className="text-sm leading-loose text-goldlt">上升{ZODIAC[signOf(chart.asc)]} —— 你给世界的第一印象偏向{SIGN_KW[signOf(chart.asc)]}</p>
                <p className="text-sm leading-loose opacity-90 mt-2">☉ 太阳在{fmt(chart.lons[0])}({SIGN_KW[signOf(chart.lons[0])]})· 第 {chart.houses[0]} 宫: {houseCore(chart.houses[0]).core}—— 核心自我</p>
                <p className="text-sm leading-loose opacity-90 mt-2">☽ 月亮在{fmt(chart.lons[1])}({SIGN_KW[signOf(chart.lons[1])]})· 第 {chart.houses[1]} 宫: {houseCore(chart.houses[1]).core}—— 内在情绪</p>
              </CollapseSection>

              <CollapseSection title={`其余行星(${BODIES.length - 2})`} open={openSec === "others"} onToggle={() => setOpenSec(v => (v === "others" ? "" : "others"))}>
                <div className="text-sm leading-loose space-y-2">
                  {BODIES.slice(2).map((b, j) => {
                    const i = j + 2;
                    return (
                      <p key={b.key} className="opacity-80">
                        {b.glyph} {b.name} · {fmt(chart.lons[i])} · 第 {chart.houses[i]} 宫: {houseCore(chart.houses[i]).core}
                      </p>
                    );
                  })}
                </div>
              </CollapseSection>

              {chart.aspects.length > 0 && (
                <CollapseSection title={`主要相位(${chart.aspects.length}) · 《顺逆皆宜》`} open={openSec === "aspects"} onToggle={() => setOpenSec(v => (v === "aspects" ? "" : "aspects"))}>
                  <div className="text-sm leading-loose space-y-2">
                    {chart.aspects.slice(0, 4).map((a, k) => (
                      <p key={k} className="opacity-85 leading-relaxed">
                        {BODIES[a.i].name}{a.a.name}{BODIES[a.j].name}:{aspectInterpretation(BODIES[a.i].key, BODIES[a.j].key, a.a.angle)}
                      </p>
                    ))}
                    {chart.aspects.length > 4 && (
                      <p className="text-xs opacity-50">… 其余 {chart.aspects.length - 4} 组相位详见天象页悬停</p>
                    )}
                  </div>
                </CollapseSection>
              )}

              {aiLoading && !aiText && (
                <p className="text-xs text-gold/60 tracking-widest animate-pulse text-center">✨ AI 解读生成中…</p>
              )}
              {aiText && (
                <CollapseSection title="✨ AI 本命详解" open={openSec === "ai"} onToggle={() => setOpenSec(v => (v === "ai" ? "" : "ai"))}>
                  <p className="leading-loose text-sm whitespace-pre-wrap opacity-90">{aiText}</p>
                </CollapseSection>
              )}

              <p className="text-[11px] opacity-50 text-center">
                {form.date} {form.time} · {form.city} · 中天 MC 在{fmt(chart.mc)}
              </p>
              <p className="text-[10px] opacity-40 text-center mt-1">
                简易星历:日月较准,外行星误差约 1–2°;国外出生已按城市时区换算。仅供娱乐参考。
              </p>
            </div>
          </div>
        )}
    </>
  );

  if (inline) {
    return (
      <div className="border border-gold/25 rounded-xl bg-ink/40 p-6">
        <h2 className="text-goldlt tracking-[0.4em] text-center mb-5">✦ 本 命 星 盘 ✦</h2>
        {content}
      </div>
    );
  }

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="relative max-w-4xl w-full border border-gold/40 rounded-2xl bg-ink p-6 my-8"
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="关闭"
          className="absolute top-4 right-4 text-gold/50 hover:text-gold text-lg">✕</button>
        <h2 className="text-goldlt tracking-[0.4em] text-center mb-5">✦ 本 命 星 盘 ✦</h2>
        {content}
      </motion.div>
    </motion.div>
  );
}
