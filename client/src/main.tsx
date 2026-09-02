import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/** 根级错误边界:任何未捕获的渲染异常都显示可读错误,而不是整树卸载黑屏 */
class RootBoundary extends React.Component<{ children: React.ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { err: String(e) };
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ color: "#cbb26a", textAlign: "center", padding: "38vh 24px", fontFamily: "serif" }}>
          <div>✦ 页面启动失败 ✦</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12, wordBreak: "break-all" }}>{this.state.err}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootBoundary>
    <App />
  </RootBoundary>
);
