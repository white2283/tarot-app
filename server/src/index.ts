import "dotenv/config";
import { buildApp } from "./app";
import { createDb } from "./db";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";

const port = Number(process.env.PORT ?? 8787);
const accessCode = process.env.ACCESS_CODE ?? "tarot";
if (process.env.NODE_ENV === "production" && (!process.env.ACCESS_CODE || process.env.ACCESS_CODE === "tarot")) {
  console.warn("⚠️  警告:生产环境未设置专属 ACCESS_CODE,正在使用默认口令,请立即在 .env 中配置!");
}

buildApp({ db: createDb(), accessCode }).then(async app => {
  if (process.env.NODE_ENV === "production") {
    // 以进程工作目录为基准(开发:dev:server 与生产 pm2 都在项目根启动)
    const root = join(process.cwd(), "dist");
    await app.register(fastifyStatic, {
      root,
      // index.html 不缓存:避免用户手机缓存到旧页面(如 CSP 坏掉时的空壳),下次访问强制重新校验
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.header("Cache-Control", "no-cache, must-revalidate");
        }
      }
    });
    app.setNotFoundHandler((req, reply) => {
      // SPA 回退:未匹配的 /api/* 返回 404 JSON,其余路径回退到 index.html
      if (req.url.startsWith("/api/")) return reply.code(404).send({ error: "not found" });
      return reply.sendFile("index.html");
    });
  }
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`server listening on ${port}`);
});
