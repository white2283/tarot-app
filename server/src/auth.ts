import type { FastifyReply, FastifyRequest } from "fastify";
import type { DatabaseSync } from "node:sqlite";

declare module "fastify" {
  interface FastifyRequest { visitorId?: string; }
}

export function makeAuthHook(db: DatabaseSync) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? "");
    const id = m?.[1];
    const ok = id && db.prepare("SELECT 1 FROM visitors WHERE id = ?").get(id);
    if (!ok) return reply.code(401).send({ error: "未授权" });
    req.visitorId = id;
  };
}
