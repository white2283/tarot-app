// x/y:容器百分比;rotate:覆盖牌(凯尔特十字第 2 张横置)
export const SPREAD_LAYOUTS: Record<string, { x: number; y: number; rotate?: number }[]> = {
  "daily": [{ x: 50, y: 40 }],
  "time-flow": [{ x: 22, y: 40 }, { x: 50, y: 40 }, { x: 78, y: 40 }],
  "body-mind-spirit": [{ x: 50, y: 18 }, { x: 26, y: 58 }, { x: 74, y: 58 }],
  "diamond": [{ x: 50, y: 12 }, { x: 26, y: 45 }, { x: 74, y: 45 }, { x: 50, y: 78 }],
  "choice": [{ x: 50, y: 12 }, { x: 24, y: 38 }, { x: 76, y: 38 }, { x: 34, y: 70 }, { x: 66, y: 70 }],
  "grand-cross": [{ x: 22, y: 45 }, { x: 78, y: 45 }, { x: 50, y: 14 }, { x: 50, y: 76 }, { x: 50, y: 45 }],
  "celtic-cross": [
    { x: 36, y: 50 }, { x: 36, y: 50, rotate: 90 }, { x: 36, y: 76 }, { x: 14, y: 50 },
    { x: 36, y: 20 }, { x: 58, y: 50 }, { x: 84, y: 84 }, { x: 84, y: 62 },
    { x: 84, y: 40 }, { x: 84, y: 18 }
  ]
};
