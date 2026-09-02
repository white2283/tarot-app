// 今日天象·离线模板解读:把实时天象数据翻译成普通人能懂的话
import { signOf, ZODIAC } from "./ephemeris";

export interface SkyInput {
  sunLon: number;
  moonLon: number;
  phase: string;
  illum: number; // 0–1
  retroNames: string[]; // 逆行行星中文名
  aspects: { a: string; b: string; name: string; desc: string; essence?: string }[]; // a/b 为行星中文名
}

const SIGN_THEME = [
  "行动与开始", "享受与扎根", "交流与信息", "家庭与照顾", "表达与舞台", "整理与服务",
  "关系与合作", "深度与真相", "远方与信念", "事业与责任", "社群与未来", "疗愈与独处"
];

export function skyTemplate(s: SkyInput): string {
  const parts: string[] = [];
  parts.push(
    `此刻太阳在${ZODIAC[signOf(s.sunLon)]}座,主题是${SIGN_THEME[signOf(s.sunLon)]};` +
    `月亮在${ZODIAC[signOf(s.moonLon)]}座,情绪偏向${SIGN_THEME[signOf(s.moonLon)]}。`
  );
  parts.push(`${s.phase}(照亮 ${Math.round(s.illum * 100)}%),` +
    (s.illum < 0.5 ? "能量在积蓄,适合播种和起步。" : "能量趋于圆满,适合推进和收获。"));
  if (s.retroNames.length > 0) {
    parts.push(`${s.retroNames.join("、")}正在逆行——旧事务值得回头看一眼。`);
  }
  if (s.aspects.length > 0) {
    const top = s.aspects.slice(0, 2)
      .map(a => `${a.a}${a.name}${a.b}(${a.essence ?? a.desc})`)
      .join(";");
    parts.push(`相位上:${top}。`);
  }
  return parts.join("");
}
