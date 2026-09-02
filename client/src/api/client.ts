export function getToken(): string | null {
  try { return localStorage.getItem("tarot_token"); } catch { return null; }
}
export function setToken(t: string) {
  try { localStorage.setItem("tarot_token", t); } catch { /* 禁用存储的 WebView 也能正常使用 */ }
}

export interface HealthInfo { ok: boolean; aiEnabled: boolean; }

export async function checkHealth(): Promise<HealthInfo> {
  const r = await fetch("/api/health");
  if (!r.ok) return { ok: false, aiEnabled: false };
  const j = await r.json() as Partial<HealthInfo>;
  return { ok: Boolean(j.ok), aiEnabled: Boolean(j.aiEnabled) };
}

export async function auth(code: string): Promise<string> {
  const r = await fetch("/api/auth", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ code })
  });
  if (!r.ok) throw new Error("口令错误");
  return (await r.json()).token as string;
}

export interface AiPayload {
  question: string; domain: string; spreadName: string;
  items: { positionName: string; cardName: string; reversed: boolean }[];
  mode?: "tarot" | "natal" | "sky";
}

export async function requestAiReading(payload: AiPayload): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 300_000);
  try {
    const r = await fetch("/api/interpret", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()).text as string;
  } finally {
    clearTimeout(timer);
  }
}

export interface HistoryItem { id: number; question: string; spreadId: string; aiEnhanced: number; favorite: number; createdAt: string; }

export async function saveReading(payload: {
  question: string; deckId: string; spreadId: string;
  cards: unknown; interpretationText: string; aiEnhanced: boolean;
}): Promise<number> {
  const r = await fetch("/api/history", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).id as number;
}

export async function listReadings(): Promise<HistoryItem[]> {
  const r = await fetch("/api/history", { headers: { authorization: `Bearer ${getToken()}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).items as HistoryItem[];
}

export interface ReadingDetail extends HistoryItem {
  deckId: string;
  cards: { id: string; reversed: boolean; position: number }[];
  interpretationText: string;
}
export async function getReading(id: number): Promise<ReadingDetail> {
  const r = await fetch(`/api/history/${id}`, { headers: { authorization: `Bearer ${getToken()}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as ReadingDetail;
}

export async function deleteReading(id: number): Promise<void> {
  const r = await fetch(`/api/history/${id}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${getToken()}` }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

export async function toggleFavorite(id: number, favorite: boolean): Promise<void> {
  const r = await fetch(`/api/history/${id}/favorite`, {
    method: "PATCH",
    headers: { "content-type": "application/json", authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ favorite })
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}
