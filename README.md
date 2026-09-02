# 星轨塔罗 ✦ Tarot & Astrology Web App

一套**塔罗占卜 + 占星**知识型 Web 应用:塔罗抽牌与 AI 深度解读、占星台(实时天象 + 本命星盘)、塔罗/占星知识库。

> 🖥️ **在线体验**:http://117.72.223.79:9999/(免口令,手机/电脑打开即用)

> ⚠️ 本项目为娱乐参考用途,所有占卜与星盘内容**仅供娱乐**,不构成任何专业建议。

## ✨ 功能

- **塔罗占卜**:多牌阵(每日一抽 / 时间之流 / 身心灵 / 钻石 / 二择一 / 大十字 / 凯尔特十字),翻牌动画、正逆位、规则解读 + AI 深度解读,记录可存历史
- **塔罗知识**:入门基础、牌义速查、经典牌阵(附**牌阵对比表**)、正逆位、四元素、宫廷牌、读牌技巧、FAQ
- **占星台 · 今日天象**:实时行星落座、相位与月相解读
- **占星台 · 本命星盘**:出生日期/时间/城市 → 计算上升/中天/九大行星落座落宫(等宫制,与主流占星 App 一致),宫位线轮盘、时区自动换算(支持夏令时)、AI 14 章深度解读(含警惕与提示)
- **占星知识**:宫位 / 相位 / 星座 / 行星(知识摘要与卡片自建)
- 免口令开放模式可选、SQLite 本地存储、响应式移动端适配

## 🧰 技术栈

- 前端:React 19 + Vite + TypeScript + Tailwind CSS v3 + framer-motion
- 后端:Fastify 5 + node:sqlite(Node ≥ 22 内置 SQLite)
- 测试:Vitest(67 个用例)

## 🚀 快速开始

要求:Node.js ≥ 22

```bash
git clone https://github.com/white2283/tarot-app.git
cd tarot-app
npm install
cp .env.example .env      # 按需填写 ACCESS_CODE 与 AI key(可选)
npm run dev
```

- 前端(Vite 开发服务器):http://localhost:7100(`/api` 自动代理到后端)
- 后端(Fastify):http://localhost:8787

不带 `AI_API_KEY` 也能跑:塔罗用内置规则解读、本命盘用模板解读;填入 [Moonshot](https://platform.moonshot.cn) 的 key 即开启 AI 深度解读(`AI_MODEL` 支持 kimi-k2.7-code-highspeed 等)。

### 🤖 接入任意 OpenAI 兼容模型(不限于 Moonshot)

AI 调用走标准的 `POST {AI_BASE_URL}/chat/completions`,改 `.env` 三个变量即可换任意 OpenAI 兼容服务:

```env
AI_BASE_URL=https://api.deepseek.com/v1    # 或 OpenAI / 智谱 / 本地 vLLM / Ollama 网关等
AI_API_KEY=sk-你的key
AI_MODEL=deepseek-chat                     # 对应服务里的模型名
AI_MAX_TOKENS=8192                          # 单次输出上限;小上下文模型可调低
AI_TEMPERATURE=                             # 留空=不传(默认1);想更稳定可设 0.8
```

常用示例:Moonshot `https://api.moonshot.cn/v1`、DeepSeek `https://api.deepseek.com/v1`、OpenAI `https://api.openai.com/v1`、本地 vLLM/Ollama 的 OpenAI 网关地址。

## ✅ 测试与构建

```bash
npm test              # vitest 67 用例
npm run build         # 构建前端到 dist/ + 服务端编译
```

## 📦 生产部署(Linux + pm2)

```bash
npm install
npm run build
pm2 start ecosystem.config.cjs   # 读 .env 的 PORT(默认 8787)
```

> 说明:`ecosystem.config.cjs` 指定了 Node 24 解释器路径,可按你的环境修改。

## 🗂️ 目录结构

```
client/       前端(React)
  public/      静态资源:牌图 cards/、favicon、diag.html
  src/         组件/页面/星历(ephemeris/houses/timezones/cities)/知识数据
server/       后端 Fastify + node:sqlite(路由/鉴权/AI 代理/维护)
shared/       前后端共享核心(塔罗规则解读)
```

## ⚖️ 说明

- 卡牌图片来自公共领域韦特塔罗牌组;知识库文字为自行整理的摘要与卡片。
- 书籍原文全文**未包含**在仓库中(版权原因);需要原文章节数据的部署,请自行准备并放入 `client/public/books/`。

## 📄 License

本仓库代码仅供学习参考,请勿用于商业用途。
