import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { buildPrompt, PROMPT_VERSION, type InterpretPayload } from "./ai";

const DAILY_LIMIT = 20;

export function registerInterpret(app: FastifyInstance, db: DatabaseSync, aiCall?: (prompt: string) => Promise<string>) {
  app.post("/api/interpret", async (req, reply) => {
    const body = req.body as InterpretPayload;
    if (!body || typeof body.question !== "string" || body.question.length > 500
        || typeof body.spreadName !== "string"
        || !Array.isArray(body.items) || body.items.length > 48
        || body.items.some(it => !it || typeof it.positionName !== "string" || typeof it.cardName !== "string")) {
      return reply.code(400).send({ error: "bad request" });
    }
    const visitorId = req.visitorId!;
    const day = new Date().toISOString().slice(0, 10);
    const usage = db.prepare("SELECT count FROM ai_usage WHERE visitor_id = ? AND day = ?")
      .get(visitorId, day) as { count: number } | undefined;
    if ((usage?.count ?? 0) >= DAILY_LIMIT) {
      return reply.code(429).send({ fallback: true, reason: "daily-limit" });
    }
    const key = createHash("sha256").update(JSON.stringify(body) + "|pv" + PROMPT_VERSION).digest("hex");
    const hit = db.prepare("SELECT text FROM ai_cache WHERE key = ?").get(key) as { text: string } | undefined;
    if (hit) return { text: hit.text, cached: true };
    if (!aiCall) return reply.code(502).send({ fallback: true });
    try {
      const text = await aiCall(buildPrompt(body));
      db.prepare("INSERT OR REPLACE INTO ai_cache(key, text) VALUES (?, ?)").run(key, text);
      db.prepare(`INSERT INTO ai_usage(visitor_id, day, count) VALUES (?, ?, 1)
                  ON CONFLICT(visitor_id, day) DO UPDATE SET count = count + 1`).run(visitorId, day);
      return { text, cached: false };
    } catch (err) {
      req.log.error(err);
      return reply.code(502).send({ fallback: true });
    }
  });
}
