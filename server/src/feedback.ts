import type { FastifyInstance } from "fastify";
import type { DatabaseSync } from "node:sqlite";

interface FeedbackBody { content: string; contact?: string; }

export function registerFeedback(app: FastifyInstance, db: DatabaseSync) {
  app.post("/api/feedback", async (req, reply) => {
    const b = (req.body ?? {}) as FeedbackBody;
    if (typeof b.content !== "string" || !b.content.trim() || b.content.length > 1000) {
      return reply.code(400).send({ error: "bad request" });
    }
    const contact = typeof b.contact === "string" && b.contact.length <= 200 ? b.contact : "";
    const r = db.prepare("INSERT INTO feedback(visitor_id, content, contact) VALUES (?, ?, ?)")
      .run(req.visitorId as string, b.content.trim(), contact.trim());
    return { id: Number(r.lastInsertRowid) };
  });
}
