import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "client",
  plugins: [react()],
  build: {
    outDir: "../dist",
    // 保留旧 hash 资产:被缓存旧 index.html 的手机引用旧 JS 时不再 404(否则必黑屏),
    // 直到它们的缓存自然过期。每次部署约几 MB,可接受。
    emptyOutDir: false,
    // 兼容老手机:Vite 8 默认目标 baseline-widely-available(需 Safari 16+ / Chrome 107+),
    // 旧 iOS/安卓浏览器会因整包含 ??=、私有类字段等新语法而解析失败 → 页面空白无字。
    // 降到 ES2018 / Safari 12(2018 年后的设备均可解析),由 esbuild 转译新语法。
    target: ["es2018", "safari12"],
    cssTarget: ["safari12"]
  },
  server: {
    port: 7100,
    proxy: { "/api": "http://localhost:8787" }
  }
});
