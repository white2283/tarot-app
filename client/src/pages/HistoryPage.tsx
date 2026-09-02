import { useEffect, useState } from "react";
import { listReadings, getReading, deleteReading, toggleFavorite, type HistoryItem, type ReadingDetail } from "../api/client";
import { getSpread } from "../../../shared/core/spreads";
import { DECKS } from "../decks";
import CardFace from "../components/CardFace";

/** 占星类历史条目的牌阵名映射(占星记录不经过 SPREADS) */
const ASTRO_SPREAD_NAMES: Record<string, string> = {
  sky: "今日天象",
  natal: "本命星盘"
};

export default function HistoryPage({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, ReadingDetail>>({});
  const [detailErr, setDetailErr] = useState<Record<number, boolean>>({});
  const [notice, setNotice] = useState("");
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    listReadings().then(setItems).catch(() => setErr("暂时无法读取历史")).finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (details[id] || detailErr[id]) return;
    try {
      const d = await getReading(id);
      setDetails(prev => ({ ...prev, [id]: d }));
    } catch {
      setDetailErr(prev => ({ ...prev, [id]: true }));
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除这条解读记录吗?")) return;
    try {
      await deleteReading(id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (openId === id) setOpenId(null);
      setNotice("");
    } catch {
      setNotice("删除失败,请重试");
    }
  };

  const spreadName = (id: string) => ASTRO_SPREAD_NAMES[id] ?? getSpread(id)?.name ?? id;

  const star = async (id: number, favorite: boolean) => {
    try {
      await toggleFavorite(id, favorite);
      setItems(prev => prev.map(x => x.id === id ? { ...x, favorite: favorite ? 1 : 0 } : x));
      if (details[id]) setDetails(prev => ({ ...prev, [id]: { ...prev[id], favorite: favorite ? 1 : 0 } }));
      setNotice("");
    } catch {
      setNotice("收藏操作失败,请重试");
    }
  };

  const shown = favOnly ? items.filter(it => it.favorite === 1) : items;

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 mb-8">← 返回</button>
      <h2 className="text-goldlt tracking-[0.4em] mb-8">过往解读</h2>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setFavOnly(false)}
            className={`text-xs tracking-widest rounded-full border px-3 py-1.5 transition-all ${!favOnly ? "border-gold text-goldlt bg-gold/10" : "border-gold/25 opacity-50 hover:opacity-90"}`}>
            全部
          </button>
          <button onClick={() => setFavOnly(true)}
            className={`text-xs tracking-widest rounded-full border px-3 py-1.5 transition-all ${favOnly ? "border-gold text-goldlt bg-gold/10" : "border-gold/25 opacity-50 hover:opacity-90"}`}>
            ★ 收藏
          </button>
        </div>
        <span className="text-xs opacity-40">{shown.length} 条</span>
      </div>
      {loading && <p className="opacity-50">读取中…</p>}
      {err && <p className="opacity-50">{err}</p>}
      {!loading && !err && shown.length === 0 && <p className="opacity-50">{favOnly ? "还没有收藏的记录" : "还没有保存过解读"}</p>}
      {notice && <p className="text-red-400 text-sm mb-4">{notice}</p>}
      <div className="flex flex-col gap-4">
        {shown.map(it => (
          <div key={it.id} className="border border-gold/25 rounded-xl bg-ink/40 overflow-hidden">
            <div className="flex">
              <button onClick={() => toggle(it.id)}
                className="flex-1 text-left p-4 hover:bg-gold/5 transition-colors">
                <div className="text-goldlt">{it.question || "(未填写问题)"}</div>
                <div className="text-xs opacity-50 mt-2">
                  {it.createdAt} · {spreadName(it.spreadId)}{it.aiEnhanced ? " · AI 深度版" : ""}
                  <span className="float-right">{openId === it.id ? "收起 ▲" : "展开 ▼"}</span>
                </div>
              </button>
              <button onClick={() => star(it.id, it.favorite !== 1)} aria-label={it.favorite ? "取消收藏" : "收藏"}
                className={`px-3 transition-colors ${it.favorite ? "text-gold" : "text-gold/30 hover:text-gold/70"}`}>
                {it.favorite ? "★" : "☆"}
              </button>
              <button onClick={() => remove(it.id)} aria-label="删除这条解读"
                className="px-4 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                ✕
              </button>
            </div>
            {openId === it.id && (
              <div className="px-4 pb-4 border-t border-gold/15">
                {!details[it.id] && !detailErr[it.id] && <p className="text-sm opacity-50 mt-3">展开中…</p>}
                {detailErr[it.id] && <p className="text-sm opacity-50 mt-3">读取失败,请稍后再试</p>}
                {details[it.id] && (
                  <>
                    {/* 当时的牌面回看:按位置顺序展示卡面+正逆位 */}
                    <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1 mt-1">
                      {[...details[it.id].cards]
                        .sort((a, b) => a.position - b.position)
                        .map(c => {
                          const card = DECKS[details[it.id].deckId]?.cards.find(x => x.id === c.id);
                          if (!card) return null;
                          const posName = getSpread(details[it.id].spreadId)?.positions[c.position]?.name
                            ?? `位置 ${c.position + 1}`;
                          return (
                            <div key={c.position} className="w-16 shrink-0 flex flex-col items-center gap-1">
                              <div className="w-full overflow-hidden rounded-lg border border-gold/25 bg-ink/60">
                                <CardFace card={card} reversed={c.reversed} />
                              </div>
                              <span className="text-[9px] text-gold/60 leading-tight text-center">{posName}</span>
                              <span className={`text-[9px] tracking-wider ${c.reversed ? "text-gold/50" : "text-gold/80"}`}>
                                {c.reversed ? "逆位" : "正位"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    <p className="text-sm leading-loose whitespace-pre-wrap mt-2 opacity-90">
                      {details[it.id].interpretationText}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
