import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getToken } from "../api/client";

/** 浮动反馈入口:右下角 ✉ → 弹窗留言(内容必填,联系方式选填) */
export default function FloatingFeedback() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async () => {
    if (!content.trim()) return;
    setState("sending");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ content: content.trim(), contact: contact.trim() })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setState("done");
      setContent("");
      setContact("");
      setTimeout(() => { setOpen(false); setState("idle"); }, 1500);
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="反馈"
        className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full border border-gold/50 bg-ink/80 text-goldlt hover:bg-gold/15 hover:shadow-[0_0_16px_rgba(212,175,55,0.35)] transition-all text-lg">
        ✉
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overscroll-contain"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}>
            <motion.div
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md border border-gold/40 rounded-2xl bg-ink p-6">
              <div className="text-goldlt tracking-[0.3em] text-center mb-4">✉ 留 下 你 的 声 音</div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="体验如何?哪里不对劲?想加什么功能?"
                className="w-full h-28 bg-ink/60 border border-gold/40 rounded-xl p-4 text-goldlt text-sm placeholder:opacity-40 focus:border-gold outline-none" />
              <input value={contact} onChange={e => setContact(e.target.value)}
                placeholder="联系方式(选填,想让我们回复你时留下)"
                className="w-full mt-3 bg-ink/60 border border-gold/40 rounded-xl px-4 py-2.5 text-goldlt text-sm placeholder:opacity-40 focus:border-gold outline-none" />
              <div className="flex justify-center mt-5">
                <button onClick={submit} disabled={state === "sending" || !content.trim()}
                  className="px-10 py-2.5 border border-gold rounded-full text-goldlt tracking-[0.3em] hover:bg-gold/10 disabled:opacity-40">
                  {state === "sending" ? "发送中…" : state === "done" ? "已收到 ✓" : "发 送"}
                </button>
              </div>
              {state === "error" && <p className="text-red-400/80 text-xs text-center mt-3">发送失败,请稍后再试</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
