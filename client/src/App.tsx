import { Suspense, lazy, Component, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initialSession, reducer } from "./state/session";
import HomePage from "./pages/HomePage";
import DrawPage from "./pages/DrawPage";
import RevealPage from "./pages/RevealPage";
import ReadingPage from "./pages/ReadingPage";
import PasscodeGate from "./components/PasscodeGate";
import Starfield from "./components/Starfield";
import PageFrame from "./components/PageFrame";
import FloatingFeedback from "./components/FloatingFeedback";
import Astrolabe from "./components/Astrolabe";
import { getToken, requestAiReading, saveReading, auth, setToken, checkHealth } from "./api/client";
import { getSpread } from "../../shared/core/spreads";
import { interpretWithFallback } from "../../shared/core/interpret";

// 按需分包:知识库/历史/占星页不参与首屏,单独成 chunk
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const KnowledgePage = lazy(() => import("./pages/KnowledgePage"));
const AstroPage = lazy(() => import("./pages/AstroPage"));
const AstroKnowledgePage = lazy(() => import("./pages/AstroKnowledgePage"));

function LazyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-gold/60 tracking-[0.4em] animate-pulse">✦ 星光接引中 ✦</span>
    </div>
  );
}

/** 页面错误边界:懒加载/运行时出错时显示提示而非白屏 */
class PageErrorBoundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { err: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6">
          <span className="text-gold/60 tracking-[0.4em]">✦ 页面出错了 ✦</span>
          <p className="text-xs opacity-50 max-w-sm text-center break-all">{this.state.err}</p>
          <button onClick={() => this.setState({ err: null })}
            className="text-xs border border-gold/40 rounded-full px-4 py-1.5 text-gold/80 hover:bg-gold/10">
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, initialSession);
  const [authed, setAuthed] = useState(Boolean(getToken()));
  const [authFailed, setAuthFailed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true); // 未知时默认可用,避免误伤已配置环境
  const [savedHint, setSavedHint] = useState("");
  const [astroOpen, setAstroOpen] = useState(false);
  const dailySavedRef = useRef(false);

  // 每日一抽自动归档:解读完成后自动写入历史,无需手动保存
  useEffect(() => {
    if (s.phase !== "reading" || s.spreadId !== "daily" || !s.interpretation || dailySavedRef.current) return;
    dailySavedRef.current = true;
    const text = [s.interpretation.summary, ...s.interpretation.positions.map(p => p.text)].join("\n\n");
    saveReading({
      question: s.question, deckId: s.deckId, spreadId: "daily",
      cards: s.drawn.map((d, i) => ({ id: d.card.id, reversed: d.reversed, position: i })),
      interpretationText: text, aiEnhanced: s.interpretation.source === "ai"
    }).then(() => setSavedHint("每日一抽已自动记入历史"))
      .catch(() => setSavedHint(""));
  }, [s.phase, s.spreadId, s.interpretation, s.question, s.deckId, s.drawn]);

  // 免口令开放模式:首次打开自动签发匿名访客身份;若服务器仍设口令则回退到口令门
  useEffect(() => {
    if (!getToken()) {
      auth("")
        .then(t => { setToken(t); setAuthed(true); })
        .catch(() => setAuthFailed(true));
    }
  }, []);

  // 探测服务端 AI 是否可用,用于前端按钮状态提示
  useEffect(() => {
    checkHealth().then(h => setAiEnabled(h.aiEnabled)).catch(() => { /* 保持默认 */ });
  }, []);

  if (!authed) {
    if (authFailed) return <PasscodeGate onOk={() => setAuthed(true)} />;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gold/60 tracking-[0.4em] animate-pulse">✦ 星光接引中 ✦</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      <Starfield />
      <PageFrame />
      <FloatingFeedback />
      <AnimatePresence>
        {s.phase === "home" && (
          <motion.div key="home" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <HomePage
              deckId={s.deckId}
              onSelectDeck={deckId => dispatch({ type: "select-deck", deckId })}
              onSelect={id => dispatch({ type: "select-spread", spreadId: id })}
              onHistory={() => dispatch({ type: "go", phase: "history" })}
              onKnowledge={() => dispatch({ type: "go", phase: "knowledge" })}
              onAstro={() => dispatch({ type: "go", phase: "astro" })}
              onAstroKnowledge={() => dispatch({ type: "go", phase: "astroKnowledge" })}
              onExpandAstro={() => setAstroOpen(true)}
            />
          </motion.div>
        )}
        {s.phase === "draw" && (
          <motion.div key="draw" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <DrawPage
              deckId={s.deckId}
              spreadId={s.spreadId!}
              onDone={(question, domain, drawn) => {
                dispatch({ type: "set-question", question, domain });
                dispatch({ type: "drawn", drawn });
              }}
              onBack={() => dispatch({ type: "reset" })}
            />
          </motion.div>
        )}
        {s.phase === "reveal" && (
          <motion.div key="reveal" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <RevealPage spreadId={s.spreadId!} question={s.question} domain={s.domain} drawn={s.drawn}
              onDone={r => dispatch({ type: "interpreted", interpretation: r })}
              onBack={() => dispatch({ type: "reset" })} />
          </motion.div>
        )}
        {s.phase === "reading" && s.interpretation && (
          <motion.div key="reading" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <ReadingPage data={s.interpretation}
              aiLoading={aiLoading}
              aiEnabled={aiEnabled}
              onAi={async () => {
                setAiLoading(true);
                const spread = getSpread(s.spreadId!)!;
                const payload = {
                  question: s.question, domain: s.domain, spreadName: spread.name,
                  items: s.drawn.map((d, i) => ({
                    positionName: spread.positions[i].name,
                    cardName: d.card.name,
                    reversed: d.reversed,
                    note: `${spread.positions[i].meaning};关键词:${d.card.keywords.join("、")};${
                      d.reversed ? d.card.reversed : (d.card.domains[s.domain] ?? d.card.domains.general)
                    }`
                  }))
                };
                const r = await interpretWithFallback(
                  { question: s.question, domain: s.domain, spread, drawn: s.drawn },
                  () => requestAiReading(payload)
                );
                dispatch({ type: "interpreted", interpretation: r });
                setAiLoading(false);
                setSavedHint(r.source === "ai" ? "" : "AI 暂时不可用,已为你展示基础解读");
              }}
              onSave={async () => {
                try {
                  const text = [s.interpretation!.summary,
                    ...s.interpretation!.positions.map(p => p.text)].join("\n\n");
                  await saveReading({
                    question: s.question, deckId: s.deckId, spreadId: s.spreadId!,
                    cards: s.drawn.map((d, i) => ({ id: d.card.id, reversed: d.reversed, position: i })),
                    interpretationText: text, aiEnhanced: s.interpretation!.source === "ai"
                  });
                  setSavedHint("已保存到历史");
                } catch {
                  setSavedHint("保存失败,请重试");
                }
              }}
              savedHint={savedHint}
              onBack={() => { setSavedHint(""); dailySavedRef.current = false; dispatch({ type: "reset" }); }}
              onRestart={() => { setSavedHint(""); dailySavedRef.current = false; dispatch({ type: "reset" }); }} />
          </motion.div>
        )}
        {s.phase === "history" && (
          <motion.div key="history" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <PageErrorBoundary>
              <Suspense fallback={<LazyFallback />}>
                <HistoryPage onBack={() => dispatch({ type: "reset" })} />
              </Suspense>
            </PageErrorBoundary>
          </motion.div>
        )}
        {s.phase === "knowledge" && (
          <motion.div key="knowledge" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <PageErrorBoundary>
              <Suspense fallback={<LazyFallback />}>
                <KnowledgePage onBack={() => dispatch({ type: "reset" })} />
              </Suspense>
            </PageErrorBoundary>
          </motion.div>
        )}
        {s.phase === "astro" && (
          <motion.div key="astro" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <PageErrorBoundary>
              <Suspense fallback={<LazyFallback />}>
                <AstroPage onBack={() => dispatch({ type: "reset" })} />
              </Suspense>
            </PageErrorBoundary>
          </motion.div>
        )}
        {s.phase === "astroKnowledge" && (
          <motion.div key="astroKnowledge" initial={false} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <PageErrorBoundary>
              <Suspense fallback={<LazyFallback />}>
                <AstroKnowledgePage onBack={() => dispatch({ type: "reset" })} />
              </Suspense>
            </PageErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 星盘放大模态:渲染在 App 根层(无 transform 祖先);不用 backdrop-blur(iOS fixed+blur 会偏移) */}
      <AnimatePresence>
        {astroOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overscroll-contain"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAstroOpen(false)}>
            <motion.div
              initial={{ scale: 0.7, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              onClick={e => e.stopPropagation()}
              className="relative">
              <button onClick={() => setAstroOpen(false)} aria-label="关闭"
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full border border-gold/50 bg-ink text-gold/70 hover:text-gold">
                ✕
              </button>
              <Astrolabe large />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
