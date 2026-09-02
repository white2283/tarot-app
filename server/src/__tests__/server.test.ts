import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";
import { createDb } from "../db";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
beforeAll(async () => {
  app = await buildApp({ db: createDb(":memory:"), accessCode: "test-code" });
});
afterAll(() => app.close());

describe("鉴权", () => {
  it("开放模式(空口令)直接签发 token", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "" });
    const r = await app.inject({ method: "POST", url: "/api/auth", payload: {} });
    expect(r.statusCode).toBe(200);
    expect(r.json().token).toBeTruthy();
    await app.close();
  });
  it("健康检查无需鉴权", async () => {
    const r = await app.inject({ method: "GET", url: "/api/health" });
    expect(r.statusCode).toBe(200);
  });
  it("错误口令返回 401", async () => {
    const r = await app.inject({ method: "POST", url: "/api/auth", payload: { code: "wrong" } });
    expect(r.statusCode).toBe(401);
  });
  it("正确口令签发 token,且不同访客 token 不同", async () => {
    const r1 = await app.inject({ method: "POST", url: "/api/auth", payload: { code: "test-code" } });
    const r2 = await app.inject({ method: "POST", url: "/api/auth", payload: { code: "test-code" } });
    expect(r1.statusCode).toBe(200);
    const t1 = r1.json().token, t2 = r2.json().token;
    expect(t1).toBeTruthy();
    expect(t1).not.toBe(t2);
  });
  it("无 token 访问受保护接口返回 401", async () => {
    const r = await app.inject({ method: "GET", url: "/api/history" });
    expect(r.statusCode).toBe(401);
  });
});

describe("AI 解读代理", () => {
  async function freshApp(aiCall?: any) {
    return buildApp({ db: createDb(":memory:"), accessCode: "c", aiCall });
  }
  const body = {
    question: "q", domain: "general", spreadName: "每日一抽",
    items: [{ positionName: "今日指引", cardName: "愚人", reversed: false }]
  };
  async function tokenOf(app: any) {
    const r = await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } });
    return r.json().token;
  }

  it("未配置 aiCall 时返回 502 fallback", async () => {
    const app = await freshApp();
    const token = await tokenOf(app);
    const r = await app.inject({ method: "POST", url: "/api/interpret", headers: { authorization: `Bearer ${token}` }, payload: body });
    expect(r.statusCode).toBe(502);
    expect(r.json().fallback).toBe(true);
    await app.close();
  });
  it("坏 payload 返回 400", async () => {
    const app = await freshApp(async () => "x");
    const token = await tokenOf(app);
    const r = await app.inject({ method: "POST", url: "/api/interpret", headers: { authorization: `Bearer ${token}` }, payload: { question: 123 } });
    expect(r.statusCode).toBe(400);
    expect(r.json()).toEqual({ error: "bad request" });
    await app.close();
  });
  it("AI 成功返回文本,第二次相同请求命中缓存(不再调用 AI)", async () => {
    let calls = 0;
    const app = await freshApp(async () => { calls++; return "AI文本"; });
    const token = await tokenOf(app);
    const h = { authorization: `Bearer ${token}` };
    const r1 = await app.inject({ method: "POST", url: "/api/interpret", headers: h, payload: body });
    expect(r1.json()).toEqual({ text: "AI文本", cached: false });
    const r2 = await app.inject({ method: "POST", url: "/api/interpret", headers: h, payload: body });
    expect(r2.json()).toEqual({ text: "AI文本", cached: true });
    expect(calls).toBe(1);
    await app.close();
  });
  it("同一访客第 21 次请求被限流", async () => {
    const app = await freshApp(async () => "x");
    const token = await tokenOf(app);
    const h = { authorization: `Bearer ${token}` };
    for (let i = 0; i < 20; i++) {
      await app.inject({ method: "POST", url: "/api/interpret", headers: h, payload: { ...body, question: `q${i}` } });
    }
    const r = await app.inject({ method: "POST", url: "/api/interpret", headers: h, payload: { ...body, question: "q21" } });
    expect(r.statusCode).toBe(429);
    expect(r.json().reason).toBe("daily-limit");
    await app.close();
  });
});

describe("解读记录", () => {
  it("缺字段返回 400", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const token = (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const r = await app.inject({ method: "POST", url: "/api/history", headers: { authorization: `Bearer ${token}` }, payload: { deckId: "rws" } });
    expect(r.statusCode).toBe(400);
    expect(r.json()).toEqual({ error: "bad request" });
    await app.close();
  });
  it("保存并按访客隔离读取", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const t = async () => (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const tA = await t(), tB = await t();
    const rec = { question: "q", deckId: "rws", spreadId: "daily", cards: [{ id: "major-00", reversed: false, position: 0 }], interpretationText: "解读", aiEnhanced: false };
    const r1 = await app.inject({ method: "POST", url: "/api/history", headers: { authorization: `Bearer ${tA}` }, payload: rec });
    expect(r1.statusCode).toBe(200);
    const listA = (await app.inject({ method: "GET", url: "/api/history", headers: { authorization: `Bearer ${tA}` } })).json();
    const listB = (await app.inject({ method: "GET", url: "/api/history", headers: { authorization: `Bearer ${tB}` } })).json();
    expect(listA.items).toHaveLength(1);
    expect(listA.items[0].question).toBe("q");
    expect(listB.items).toHaveLength(0);
    await app.close();
  });
});

describe("收藏切换", () => {
  it("本人可收藏/取消收藏;他人操作 404;坏参数 400", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const t = async () => (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const tA = await t(), tB = await t();
    const rec = { question: "q", deckId: "rws", spreadId: "daily", cards: [], interpretationText: "x", aiEnhanced: false };
    const save = await app.inject({ method: "POST", url: "/api/history", headers: { authorization: `Bearer ${tA}` }, payload: rec });
    const id = save.json().id;

    // 收藏
    const fav = await app.inject({ method: "PATCH", url: `/api/history/${id}/favorite`, headers: { authorization: `Bearer ${tA}` }, payload: { favorite: true } });
    expect(fav.statusCode).toBe(200);
    expect(fav.json()).toEqual({ ok: true, favorite: true });
    const listed = (await app.inject({ method: "GET", url: "/api/history", headers: { authorization: `Bearer ${tA}` } })).json();
    expect(listed.items[0].favorite).toBe(1);
    // 他人操作 → 404
    const byOther = await app.inject({ method: "PATCH", url: `/api/history/${id}/favorite`, headers: { authorization: `Bearer ${tB}` }, payload: { favorite: false } });
    expect(byOther.statusCode).toBe(404);
    // 取消收藏
    const unfav = await app.inject({ method: "PATCH", url: `/api/history/${id}/favorite`, headers: { authorization: `Bearer ${tA}` }, payload: { favorite: false } });
    expect(unfav.statusCode).toBe(200);
    // 坏参数 → 400
    const bad = await app.inject({ method: "PATCH", url: `/api/history/${id}/favorite`, headers: { authorization: `Bearer ${tA}` }, payload: { favorite: "yes" } });
    expect(bad.statusCode).toBe(400);
    await app.close();
  });
});

describe("解读详情", () => {
  it("本人可按 id 读取完整解读,他人 404", async () => {    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const t = async () => (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const tA = await t(), tB = await t();
    const rec = { question: "q", deckId: "rws", spreadId: "daily", cards: [{ id: "major-00", reversed: false, position: 0 }], interpretationText: "完整解读全文", aiEnhanced: true };
    const save = await app.inject({ method: "POST", url: "/api/history", headers: { authorization: `Bearer ${tA}` }, payload: rec });
    const id = save.json().id;
    const own = await app.inject({ method: "GET", url: `/api/history/${id}`, headers: { authorization: `Bearer ${tA}` } });
    expect(own.statusCode).toBe(200);
    expect(own.json().interpretationText).toBe("完整解读全文");
    expect(own.json().cards).toEqual([{ id: "major-00", reversed: false, position: 0 }]);
    expect(own.json().spreadId).toBe("daily");
    const other = await app.inject({ method: "GET", url: `/api/history/${id}`, headers: { authorization: `Bearer ${tB}` } });
    expect(other.statusCode).toBe(404);
    const missing = await app.inject({ method: "GET", url: "/api/history/9999", headers: { authorization: `Bearer ${tA}` } });
    expect(missing.statusCode).toBe(404);
    await app.close();
  });
});

describe("删除解读", () => {
  it("本人可删除;他人删除 404 且记录仍在;重复删除 404", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const t = async () => (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const tA = await t(), tB = await t();
    const rec = { question: "q", deckId: "rws", spreadId: "daily", cards: [], interpretationText: "x", aiEnhanced: false };
    const save = await app.inject({ method: "POST", url: "/api/history", headers: { authorization: `Bearer ${tA}` }, payload: rec });
    const id = save.json().id;
    // 他人删除 → 404,记录仍在
    const byOther = await app.inject({ method: "DELETE", url: `/api/history/${id}`, headers: { authorization: `Bearer ${tB}` } });
    expect(byOther.statusCode).toBe(404);
    const stillThere = (await app.inject({ method: "GET", url: "/api/history", headers: { authorization: `Bearer ${tA}` } })).json();
    expect(stillThere.items).toHaveLength(1);
    // 本人删除 → 200,列表清空
    const byOwner = await app.inject({ method: "DELETE", url: `/api/history/${id}`, headers: { authorization: `Bearer ${tA}` } });
    expect(byOwner.statusCode).toBe(200);
    expect(byOwner.json()).toEqual({ ok: true });
    const gone = (await app.inject({ method: "GET", url: "/api/history", headers: { authorization: `Bearer ${tA}` } })).json();
    expect(gone.items).toHaveLength(0);
    // 重复删除 → 404
    const again = await app.inject({ method: "DELETE", url: `/api/history/${id}`, headers: { authorization: `Bearer ${tA}` } });
    expect(again.statusCode).toBe(404);
    await app.close();
  });
});

describe("反馈", () => {
  it("提交反馈成功,空内容 400", async () => {
    const app = await buildApp({ db: createDb(":memory:"), accessCode: "c" });
    const token = (await app.inject({ method: "POST", url: "/api/auth", payload: { code: "c" } })).json().token;
    const h = { authorization: `Bearer ${token}` };
    const ok = await app.inject({ method: "POST", url: "/api/feedback", headers: h, payload: { content: "洗牌动画很惊艳!", contact: "" } });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().id).toBeGreaterThan(0);
    const bad = await app.inject({ method: "POST", url: "/api/feedback", headers: h, payload: { content: "  " } });
    expect(bad.statusCode).toBe(400);
    await app.close();
  });
});
