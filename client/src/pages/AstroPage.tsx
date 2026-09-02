import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Astrolabe from "../components/Astrolabe";
import NatalChart from "../components/NatalChart";
import { listReadings, getReading, deleteReading, type HistoryItem, type ReadingDetail } from "../api/client";

const TYPE_LABEL: Record<string, string> = { sky: "今日天象", natal: "本命星盘" };

/** 占星记录:已保存的天象/本命盘解读沉淀 */
function AstroHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, ReadingDetail>>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    listReadings()
      .then(list => setItems(list.filter(x => x.spreadId === "sky" || x.spreadId === "natal")))
      .catch(() => setErr("暂时无法读取占星记录"));
  }, []);

  const toggle = async (id: number) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (details[id]) return;
    try {
      const d = await getReading(id);
      setDetails(prev => ({ ...prev, [id]: d }));
    } catch { /* 忽略 */ }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除这条占星记录吗?")) return;
    try {
      await deleteReading(id);
      setItems(prev => prev.filter(x => x.id !== id));
      setOpenId(null);
    } catch {
      setErr("删除失败,请重试");
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 border-t border-gold/25" />
        <h3 className="text-goldlt tracking-[0.4em] text-sm">✦ 占星记录 ✦</h3>
        <div className="flex-1 border-t border-gold/25" />
      </div>
      {err && <p className="text-xs opacity-60 mb-2">{err}</p>}
      {items.length === 0 && !err && (
        <p className="text-center text-xs opacity-50">还没有保存过天象或本命盘解读 —— 点击上方「💾 保存」即可沉淀到这里。</p>
      )}
      <div className="flex flex-col gap-3">
        {items.map(it => (
          <div key={it.id} className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
            <div className="flex">
              <button onClick={() => toggle(it.id)}
                className="flex-1 text-left p-4 hover:bg-gold/5 transition-colors">
                <div className="text-sm text-goldlt">
                  ✦ {TYPE_LABEL[it.spreadId] ?? it.spreadId}{it.aiEnhanced ? " · AI 深度版" : ""}
                  <span className="float-right text-gold/40 text-xs">{openId === it.id ? "收起 ▲" : "展开 ▼"}</span>
                </div>
                <div className="text-xs opacity-50 mt-1">{it.createdAt} · {it.question}</div>
              </button>
              <button onClick={() => remove(it.id)} aria-label="删除这条记录"
                className="px-4 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">✕</button>
            </div>
            {openId === it.id && details[it.id] && (
              <div className="px-4 pb-4 border-t border-gold/15">
                <p className="text-sm leading-loose whitespace-pre-wrap mt-3 opacity-90">{details[it.id].interpretationText}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 占星台:今日天象 / 本命星盘双选项卡 + 占星记录沉淀 */
export default function AstroPage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"sky" | "natal">("sky");
  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 mb-6">← 返回</button>
      <div className="text-center mb-6">
        <h2 className="text-goldlt tracking-[0.5em] title-glow text-xl">占 星 台</h2>
        <p className="text-gold/40 text-[11px] tracking-[0.3em] mt-2">实时天象 · 本命星盘 · 解读沉淀</p>
      </div>

      {/* 选项卡:比主页弹窗多出「本命盘直达 + 占星记录」 */}
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setTab("sky")}
          className={`text-xs tracking-widest rounded-full border px-5 py-2 transition-all ${tab === "sky" ? "border-gold text-goldlt bg-gold/10" : "border-gold/25 opacity-50 hover:opacity-90"}`}>
          ✦ 今日天象
        </button>
        <button onClick={() => setTab("natal")}
          className={`text-xs tracking-widest rounded-full border px-5 py-2 transition-all ${tab === "natal" ? "border-gold text-goldlt bg-gold/10" : "border-gold/25 opacity-50 hover:opacity-90"}`}>
          ☉ 本命星盘
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {tab === "sky" ? <Astrolabe large /> : <NatalChart inline />}
        </motion.div>
      </AnimatePresence>

      <AstroHistory />

      <p className="text-center text-[10px] opacity-40 tracking-widest mt-8">
        占星与天象内容仅供娱乐参考,不构成任何专业建议
      </p>
    </div>
  );
}
