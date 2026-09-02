import { useState } from "react";
import { auth, setToken } from "../api/client";

export default function PasscodeGate({ onOk }: { onOk: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    try { setToken(await auth(code)); onOk(); }
    catch { setErr("口令不对,再试试"); }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-goldlt tracking-[0.4em] text-xl">星 轨 塔 罗</div>
      <input value={code} onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        type="password" placeholder="请输入访问口令"
        className="w-64 bg-ink/60 border border-gold/40 rounded-xl px-4 py-3 text-center text-goldlt placeholder:opacity-40 focus:border-gold outline-none" />
      {err && <div className="text-red-400 text-sm">{err}</div>}
      <button onClick={submit}
        className="px-10 py-3 border border-gold rounded-full text-goldlt tracking-[0.3em] hover:bg-gold/10">
        进 入
      </button>
    </div>
  );
}
