import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { makeAuthHook } from "./auth";
import { registerInterpret } from "./interpret";
import { registerHistory } from "./history";
import { registerFeedback } from "./feedback";
import { startMaintenance } from "./maintenance";
import { callAi } from "./ai";

export interface AppOptions {
  db: DatabaseSync;
  accessCode: string;
  aiCall?: (prompt: string) => Promise<string>;
}

export async function buildApp(opts: AppOptions) {
  const { db, accessCode } = opts;
  const app = Fastify();

  const aiCall = opts.aiCall ?? (process.env.AI_API_KEY && process.env.AI_BASE_URL ? callAi : undefined);

  // 安全响应头:关闭 CSP —— 其默认 upgrade-insecure-requests 会强制 http 资源升级为 https,
  // 而本服务器为纯 HTTP 部署,会导致所有 JS/CSS 加载失败(ERR_SSL_PROTOCOL_ERROR)。保留其它安全头。
  // 另:COOP / Origin-Agent-Cluster 在纯 HTTP 下会被浏览器忽略并刷控制台警告,一并关闭保持干净。
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    originAgentCluster: false
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    // 只对 /api/* 限流;静态资源(html/js/css/图片/原文txt)全部豁免,
    // 否则重度浏览后主 bundle 可能撞 429 → 白屏无字
    allowList: (req) => !req.url.startsWith("/api/")
  });
  startMaintenance(app, db);

  app.get("/api/health", async () => ({ ok: true, aiEnabled: Boolean(aiCall) }));

  app.post("/api/auth", async (req, reply) => {
    const { code } = (req.body ?? {}) as { code?: string };
    // ACCESS_CODE 为空 = 开放模式:直接签发匿名访客 token
    if (accessCode && code !== accessCode) return reply.code(401).send({ error: "口令错误" });
    const token = randomUUID();
    db.prepare("INSERT INTO visitors(id) VALUES (?)").run(token);
    return { token };
  });

  const authHook = makeAuthHook(db);
  app.addHook("onRequest", async (req, reply) => {
    if (req.url.startsWith("/api/") && req.url !== "/api/auth" && req.url !== "/api/health") {
      await authHook(req, reply);
    }
  });

  registerInterpret(app, db, aiCall);
  registerHistory(app, db);
  registerFeedback(app, db);

  return app;
}
