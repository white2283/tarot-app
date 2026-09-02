// 宫位计算:本地恒星时 → 上升点 ASC / 中天 MC → 宫位
// 支持两种宫位制:
//  - 等宫制(equal):第 1 宫从上升点起算,每宫 30°(测测等主流手机占星 App 同款,默认)
//  - 整宫制(whole):第 1 宫 = 上升所在星座,每宫 = 整整一个星座(早期版本使用)

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (d: number) => ((d % 360) + 360) % 360;

/** 黄道倾角(随时间微小变化可忽略,取 J2000 值) */
const OBLIQUITY = 23.4393;

/** 本地恒星时(度):date 时刻 + 东经经度 lon */
export function localSiderealDegrees(date: Date, lonEast: number): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  return norm(gmst + lonEast);
}

/** 中天 MC 黄经 */
export function midheaven(ramc: number): number {
  return norm(deg(Math.atan2(Math.sin(rad(ramc)), Math.cos(rad(ramc)) * Math.cos(rad(OBLIQUITY)))));
}

/** 上升点 ASC 黄经 */
export function ascendant(ramc: number, lat: number): number {
  const y = Math.cos(rad(ramc));
  const x = -(Math.sin(rad(ramc)) * Math.cos(rad(OBLIQUITY)) + Math.tan(rad(lat)) * Math.sin(rad(OBLIQUITY)));
  return norm(deg(Math.atan2(y, x)));
}

export type HouseMode = "equal" | "whole";

/** 整宫制:行星所在宫位(1–12),第 n 宫 = 上升星座起的第 n 个星座 */
export function houseOfWhole(lon: number, asc: number): number {
  const ascSign = Math.floor(norm(asc) / 30);
  const sign = Math.floor(norm(lon) / 30);
  return ((sign - ascSign + 12) % 12) + 1;
}

/** 等宫制:行星所在宫位(1–12),第 1 宫从上升点起算,每宫 30° */
export function houseOfEqual(lon: number, asc: number): number {
  return Math.floor(((norm(lon - asc)) % 360) / 30) + 1;
}

/** 行星宫位(默认等宫制,与测测等主流 App 一致) */
export function houseOf(lon: number, asc: number, mode: HouseMode = "equal"): number {
  return mode === "equal" ? houseOfEqual(lon, asc) : houseOfWhole(lon, asc);
}

/** 整宫制:第 n 宫的起始黄经 */
export function houseCuspWhole(n: number, asc: number): number {
  const ascSign = Math.floor(norm(asc) / 30);
  return norm((ascSign + n - 1) * 30);
}

/** 等宫制:第 n 宫的起始黄经(asc + (n-1)*30) */
export function houseCuspEqual(n: number, asc: number): number {
  return norm(asc + (n - 1) * 30);
}

/** 第 n 宫的起始黄经(默认等宫制) */
export function houseCusp(n: number, asc: number, mode: HouseMode = "equal"): number {
  return mode === "equal" ? houseCuspEqual(n, asc) : houseCuspWhole(n, asc);
}

/** 便捷打包:由出生时刻+经纬度算出 ASC/MC */
export function angles(date: Date, lat: number, lonEast: number): { asc: number; mc: number } {
  const ramc = localSiderealDegrees(date, lonEast);
  return { asc: ascendant(ramc, lat), mc: midheaven(ramc) };
}
