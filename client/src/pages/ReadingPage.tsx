import InterpretationView from "../components/InterpretationView";
import type { Interpretation } from "../../../shared/core/types";

interface Props {
  data: Interpretation;
  onAi?: () => void;
  onSave?: () => void;
  onRestart: () => void;
  onBack?: () => void;
  aiLoading?: boolean;
  aiEnabled?: boolean;
  savedHint?: string;
}

export default function ReadingPage({ data, onAi, onSave, onRestart, onBack, aiLoading, aiEnabled = true, savedHint }: Props) {
  const aiUnavailable = !aiEnabled;
  return (
    <div className="min-h-screen px-6 py-12">
      {onBack && (
        <div className="max-w-2xl mx-auto mb-6">
          <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100">← 返回首页</button>
        </div>
      )}
      <InterpretationView data={data} />
      <div className="flex justify-center gap-4 mt-10 flex-wrap">
        {onAi && (
          <button onClick={onAi} disabled={aiLoading || aiUnavailable}
            title={aiUnavailable ? "服务端未配置 AI 接口" : undefined}
            className="px-8 py-3 border border-goldlt rounded-full text-goldlt tracking-widest transition-all hover:bg-gold/10 hover:shadow-[0_0_16px_rgba(212,175,55,0.25)] active:scale-95 disabled:opacity-40">
            {aiLoading ? "解读中…" : aiUnavailable ? "✨ AI 深度解读(未配置)" : "✨ AI 深度解读"}
          </button>
        )}
        {onSave && (
          <button onClick={onSave}
            className="px-8 py-3 border border-gold/50 rounded-full tracking-widest transition-all hover:bg-gold/10 hover:shadow-[0_0_16px_rgba(212,175,55,0.25)] active:scale-95">
            保存解读
          </button>
        )}
        <button onClick={onRestart}
          className="px-8 py-3 border border-gold/30 rounded-full tracking-widest opacity-70 transition-all hover:opacity-100 hover:shadow-[0_0_16px_rgba(212,175,55,0.25)] active:scale-95">
          再占一次
        </button>
      </div>
      {savedHint && <p className="text-center text-xs opacity-50 mt-4">{savedHint}</p>}
      <p className="text-center text-[10px] opacity-40 tracking-widest mt-4">
        本解读仅供娱乐参考,不构成心理、医疗或法律等任何专业建议
      </p>
    </div>
  );
}
