/** 全页装饰画框:双层金线边框 + 四角描金 + 上下中点 ✦(不阻挡点击) */
export default function PageFrame() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
      <div className="absolute inset-3 rounded-2xl border-2 border-gold/45 shadow-[0_0_18px_rgba(212,175,55,0.12)]" />
      <div className="absolute inset-6 rounded-xl border border-gold/25" />
      <div className="absolute top-1.5 left-1.5 w-12 h-12 border-t-[3px] border-l-[3px] border-gold/80 rounded-tl-2xl" />
      <div className="absolute top-1.5 right-1.5 w-12 h-12 border-t-[3px] border-r-[3px] border-gold/80 rounded-tr-2xl" />
      <div className="absolute bottom-1.5 left-1.5 w-12 h-12 border-b-[3px] border-l-[3px] border-gold/80 rounded-bl-2xl" />
      <div className="absolute bottom-1.5 right-1.5 w-12 h-12 border-b-[3px] border-r-[3px] border-gold/80 rounded-br-2xl" />
      <span className="absolute top-[9px] left-1/2 -translate-x-1/2 bg-[#0b0616] px-2 text-gold text-sm leading-none">✦</span>
      <span className="absolute bottom-[9px] left-1/2 -translate-x-1/2 bg-[#0b0616] px-2 text-gold text-sm leading-none">✦</span>
    </div>
  );
}
