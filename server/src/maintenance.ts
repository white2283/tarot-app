import type { FastifyInstance } from "fastify";
import type { DatabaseSync } from "node:sqlite";

/**
 * 数据维护:定期清理无主/过期数据,防止 visitors 与 ai_cache 无限膨胀。
 * 仅删除「30 天以上且无任何解读记录」的匿名访客及其孤儿数据,不触碰活跃用户历史。
 */
export function startMaintenance(app: FastifyInstance, db: DatabaseSync) {
  const cleanup = () => {
    try {
      db.exec(`
        DELETE FROM ai_cache WHERE created_at < datetime('now','-30 days');
        DELETE FROM ai_usage WHERE NOT EXISTS (SELECT 1 FROM visitors WHERE visitors.id = ai_usage.visitor_id);
        DELETE FROM feedback WHERE NOT EXISTS (SELECT 1 FROM visitors WHERE visitors.id = feedback.visitor_id);
        DELETE FROM visitors WHERE created_at < datetime('now','-30 days')
          AND NOT EXISTS (SELECT 1 FROM readings WHERE readings.visitor_id = visitors.id);
      `);
    } catch (e) {
      app.log.warn(`数据维护失败:${(e as Error).message}`);
    }
  };
  // 启动即执行一次,之后每天一次
  cleanup();
  const timer = setInterval(cleanup, 24 * 60 * 60 * 1000);
  app.addHook("onClose", () => clearInterval(timer));
}
