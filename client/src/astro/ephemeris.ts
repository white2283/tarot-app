// 低精度行星位置计算(Paul Schlyter 开普勒要素法)
// 精度:太阳/月亮约 0.1–2°,行星约 1–2°——装饰性星盘足够

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (d: number) => ((d % 360) + 360) % 360;

/** 日数 d = 自 2000 年 1 月 0.0 起的日数(Schlyter 惯例) */
export function dayNumber(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5 - 2451543.5;
}

function keplerE(M: number, e: number): number {
  let E = M;
  for (let k = 0; k < 8; k++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

function sunPos(d: number): { lon: number; r: number } {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = norm(356.047 + 0.9856002585 * d);
  const E = keplerE(rad(M), e);
  const x = Math.cos(E) - e;
  const y = Math.sin(E) * Math.sqrt(1 - e * e);
  return { lon: norm(deg(Math.atan2(y, x)) + w), r: Math.hypot(x, y) };
}

export function sunLongitude(d: number): number {
  return sunPos(d).lon;
}

export function moonLongitude(d: number): number {
  const N = norm(125.1228 - 0.0529538083 * d);
  const w = norm(318.0634 + 0.1643573223 * d);
  const a = 60.2666;
  const e = 0.0549;
  const M = norm(115.3654 + 13.0649929509 * d);
  const i = 5.1454;
  const E = keplerE(rad(M), e);
  const x = a * (Math.cos(E) - e);
  const y = a * Math.sin(E) * Math.sqrt(1 - e * e);
  const r = Math.hypot(x, y);
  const v = deg(Math.atan2(y, x));
  const u = rad(v + w), Nr = rad(N), ir = rad(i);
  const xh = r * (Math.cos(Nr) * Math.cos(u) - Math.sin(Nr) * Math.sin(u) * Math.cos(ir));
  const yh = r * (Math.sin(Nr) * Math.cos(u) + Math.cos(Nr) * Math.sin(u) * Math.cos(ir));
  let lon = norm(deg(Math.atan2(yh, xh)));
  // 主要摄动项(月亮受太阳引力拉扯的修正)
  const Ms = rad(norm(356.047 + 0.9856002585 * d));
  const Lm = rad(norm(N + w + M));
  const Ls = rad(norm(356.047 + 0.9856002585 * d + 282.9404 + 4.70935e-5 * d));
  const D = Lm - Ls;
  const F = Lm - Nr;
  const Mm = rad(M);
  lon +=
    -1.274 * Math.sin(Mm - 2 * D) + 0.658 * Math.sin(2 * D) - 0.186 * Math.sin(Ms)
    - 0.059 * Math.sin(2 * Mm - 2 * D) - 0.057 * Math.sin(Mm - 2 * D + Ms)
    + 0.053 * Math.sin(Mm + 2 * D) + 0.046 * Math.sin(2 * D - Ms)
    + 0.041 * Math.sin(Mm - Ms) - 0.035 * Math.sin(D) - 0.031 * Math.sin(Mm + Ms)
    - 0.015 * Math.sin(2 * F - 2 * D) + 0.011 * Math.sin(Mm - 4 * D);
  return norm(lon);
}

interface Elements {
  N: [number, number]; i: [number, number]; w: [number, number];
  a: [number, number]; e: [number, number]; M: [number, number];
}

const PLANETS: Record<string, Elements> = {
  mercury: { N: [48.3313, 3.24587e-5], i: [7.0047, 5e-8], w: [29.1241, 1.01444e-5], a: [0.387098, 0], e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368] },
  venus: { N: [76.6799, 2.4659e-5], i: [3.3946, 2.75e-8], w: [54.891, 1.38374e-5], a: [0.72333, 0], e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244] },
  mars: { N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8], w: [286.5016, 2.92961e-5], a: [1.523688, 0], e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766] },
  jupiter: { N: [100.4542, 2.76854e-5], i: [1.303, -1.557e-7], w: [273.8777, 1.64505e-5], a: [5.20256, 0], e: [0.048498, 4.469e-9], M: [19.895, 0.0830853001] },
  saturn: { N: [113.6634, 2.3898e-5], i: [2.4886, -1.081e-7], w: [339.3939, 2.97661e-5], a: [9.55475, 0], e: [0.055546, -9.499e-9], M: [316.967, 0.0334442282] },
  uranus: { N: [74.0005, 1.3978e-5], i: [0.7733, 1.9e-8], w: [96.6612, 3.0565e-5], a: [19.18171, -1.55e-8], e: [0.047318, 7.45e-9], M: [142.5905, 0.011725806] },
  neptune: { N: [131.7806, 3.0173e-5], i: [1.77, -2.55e-7], w: [272.8461, -6.027e-6], a: [30.05826, 3.313e-8], e: [0.008606, 2.15e-9], M: [260.2471, 0.005995147] }
};

export type PlanetKey = keyof typeof PLANETS;
export const PLANET_KEYS = Object.keys(PLANETS) as PlanetKey[];

export function planetLongitude(d: number, key: PlanetKey): number {
  const p = PLANETS[key];
  const N = p.N[0] + p.N[1] * d;
  const w = p.w[0] + p.w[1] * d;
  const a = p.a[0] + p.a[1] * d;
  const e = p.e[0] + p.e[1] * d;
  const M = norm(p.M[0] + p.M[1] * d);
  const i = p.i[0] + p.i[1] * d;
  const E = keplerE(rad(M), e);
  const x = a * (Math.cos(E) - e);
  const y = a * Math.sin(E) * Math.sqrt(1 - e * e);
  const r = Math.hypot(x, y);
  const v = deg(Math.atan2(y, x));
  const u = rad(v + w), Nr = rad(N), ir = rad(i);
  const xh = r * (Math.cos(Nr) * Math.cos(u) - Math.sin(Nr) * Math.sin(u) * Math.cos(ir));
  const yh = r * (Math.sin(Nr) * Math.cos(u) + Math.cos(Nr) * Math.sin(u) * Math.cos(ir));
  const sun = sunPos(d);
  const xg = xh + sun.r * Math.cos(rad(sun.lon));
  const yg = yh + sun.r * Math.sin(rad(sun.lon));
  return norm(deg(Math.atan2(yg, xg)));
}

/** 月亮照亮比例 0–1 */
export function moonIllumination(d: number): number {
  const elong = rad(norm(moonLongitude(d) - sunLongitude(d)));
  return (1 - Math.cos(elong)) / 2;
}

export function moonPhaseName(d: number): string {
  const el = norm(moonLongitude(d) - sunLongitude(d));
  if (el < 22.5 || el >= 337.5) return "新月";
  if (el < 67.5) return "娥眉月";
  if (el < 112.5) return "上弦月";
  if (el < 157.5) return "盈凸月";
  if (el < 202.5) return "满月";
  if (el < 247.5) return "亏凸月";
  if (el < 292.5) return "下弦月";
  return "残月";
}

export const ZODIAC = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];
export const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

/** 黄经 → 宫位序号 0–11 */
export function signOf(lon: number): number {
  return Math.floor(norm(lon) / 30);
}
