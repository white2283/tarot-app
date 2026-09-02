import { DatabaseSync } from "node:sqlite";

export function createDb(path = process.env.DB_PATH ?? "data.db") {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors(
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS readings(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      deck_id TEXT NOT NULL,
      question TEXT,
      spread_id TEXT NOT NULL,
      cards_json TEXT NOT NULL,
      interpretation_text TEXT NOT NULL,
      ai_enhanced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ai_cache(
      key TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ai_usage(
      visitor_id TEXT NOT NULL,
      day TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY(visitor_id, day)
    );
    CREATE TABLE IF NOT EXISTS feedback(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT,
      content TEXT NOT NULL,
      contact TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  // 迁移:老库补充收藏列
  const cols = db.prepare("PRAGMA table_info(readings)").all() as { name: string }[];
  if (!cols.some(c => c.name === "favorite")) {
    db.exec("ALTER TABLE readings ADD COLUMN favorite INTEGER DEFAULT 0");
  }
  // 常用查询索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_readings_visitor ON readings(visitor_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_feedback_visitor ON feedback(visitor_id);
  `);
  return db;
}
