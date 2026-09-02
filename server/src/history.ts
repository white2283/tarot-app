import type { FastifyInstance } from "fastify";
import type { DatabaseSync } from "node:sqlite";

interface SaveBody {
  question: string; deckId: string; spreadId: string;
  cards: unknown; interpretationText: string; aiEnhanced: boolean;
}

export function registerHistory(app: FastifyInstance, db: DatabaseSync) {
  app.post("/api/history", async (req, reply) => {
    const b = req.body as SaveBody;
    if (!b || typeof b.deckId !== "string" || typeof b.spreadId !== "string" || typeof b.interpretationText !== "string") {
      return reply.code(400).send({ error: "bad request" });
    }
    const visitorId = req.visitorId as string;
    const r = db.prepare(`INSERT INTO readings(visitor_id, deck_id, question, spread_id, cards_json, interpretation_text, ai_enhanced)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(visitorId, b.deckId, b.question ?? "", b.spreadId,
           JSON.stringify(b.cards), b.interpretationText, b.aiEnhanced ? 1 : 0);
    return { id: Number(r.lastInsertRowid) };
  });

  app.get("/api/history", async (req) => {
    const rows = db.prepare(`SELECT id, question, spread_id AS spreadId, ai_enhanced AS aiEnhanced,
                             favorite, created_at AS createdAt
                             FROM readings WHERE visitor_id = ? ORDER BY id DESC LIMIT 100`)
      .all(req.visitorId as string);
    return { items: rows };
  });

  app.get("/api/history/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ error: "bad request" });
    const row = db.prepare(`SELECT id, question, deck_id AS deckId, spread_id AS spreadId, cards_json AS cardsJson,
                            interpretation_text AS interpretationText, ai_enhanced AS aiEnhanced,
                            favorite, created_at AS createdAt
                            FROM readings WHERE id = ? AND visitor_id = ?`)
      .get(id, req.visitorId as string) as { cardsJson: string } & Record<string, unknown> | undefined;
    if (!row) return reply.code(404).send({ error: "not found" });
    const { cardsJson, ...rest } = row;
    return { ...rest, cards: JSON.parse(cardsJson) };
  });

  // 收藏切换
  app.patch("/api/history/:id/favorite", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const body = (req.body ?? {}) as { favorite?: unknown };
    if (!Number.isInteger(id) || id <= 0 || typeof body.favorite !== "boolean") {
      return reply.code(400).send({ error: "bad request" });
    }
    const r = db.prepare("UPDATE readings SET favorite = ? WHERE id = ? AND visitor_id = ?")
      .run(body.favorite ? 1 : 0, id, req.visitorId as string);
    if (r.changes === 0) return reply.code(404).send({ error: "not found" });
    return { ok: true, favorite: body.favorite };
  });

  app.delete("/api/history/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ error: "bad request" });
    const r = db.prepare("DELETE FROM readings WHERE id = ? AND visitor_id = ?").run(id, req.visitorId as string);
    if (r.changes === 0) return reply.code(404).send({ error: "not found" });
    return { ok: true };
  });
}
