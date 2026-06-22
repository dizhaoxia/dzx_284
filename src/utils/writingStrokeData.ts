import type { WritingStrokeData, StrokePoint } from '@/types';

const W = 200;
const H = 200;
const CX = W / 2;
const CY = H / 2;

function genArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, steps: number = 30): StrokePoint[] {
  const pts: StrokePoint[] = [];
  const step = (endAngle - startAngle) / steps;
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + step * i;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function genLine(x1: number, y1: number, x2: number, y2: number, steps: number = 20): StrokePoint[] {
  const pts: StrokePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return pts;
}

function genCurve(p1: StrokePoint, p2: StrokePoint, p3: StrokePoint, steps: number = 30): StrokePoint[] {
  const pts: StrokePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x;
    const y = (1 - t) ** 2 * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y;
    pts.push({ x, y });
  }
  return pts;
}

export const WRITING_STROKE_DATA: Record<string, WritingStrokeData> = {
  'b': {
    pinyin: 'b',
    strokes: [
      { points: genLine(CX - 40, 40, CX - 40, 160), direction: 'down' },
      { points: [
        ...genArc(CX + 10, CY - 10, 35, Math.PI * 1.3, Math.PI * 1.8, 15),
        ...genArc(CX + 10, CY + 10, 35, -Math.PI * 0.8, -Math.PI * 1.3, 15),
      ], direction: 'curve-right' },
    ],
    boundingBox: { width: W, height: H },
  },
  'p': {
    pinyin: 'p',
    strokes: [
      { points: genLine(CX - 30, 40, CX - 30, 180), direction: 'down' },
      { points: genArc(CX + 20, CY - 20, 35, Math.PI * 1.3, Math.PI * 1.8, 30).concat(
          genArc(CX + 20, CY - 20, 35, -Math.PI * 0.8, -Math.PI * 1.3, 15)
      ), direction: 'curve-right' },
    ],
    boundingBox: { width: W, height: H },
  },
  'm': {
    pinyin: 'm',
    strokes: [
      { points: genLine(CX - 60, 50, CX - 60, 160), direction: 'down' },
      { points: [...genCurve({ x: CX - 60, y: 50 }, { x: CX - 30, y: 30 }, { x: CX, y: 160 })], direction: 'arc-down' },
      { points: [...genCurve({ x: CX, y: 50 }, { x: CX + 30, y: 30 }, { x: CX + 60, y: 160 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'f': {
    pinyin: 'f',
    strokes: [
      { points: [...genCurve({ x: CX + 10, y: 30 }, { x: CX - 30, y: 50 }, { x: CX - 10, y: 160 })], direction: 'curve' },
      { points: genLine(CX - 40, CY - 10, CX + 20, CY - 10), direction: 'right' },
    ],
    boundingBox: { width: W, height: H },
  },
  'd': {
    pinyin: 'd',
    strokes: [
      { points: [
        ...genArc(CX - 10, CY - 10, 35, Math.PI * 1.2, Math.PI * 1.8, 15),
        ...genArc(CX - 10, CY + 10, 35, -Math.PI * 0.7, -Math.PI * 1.2, 15),
      ], direction: 'curve-left' },
      { points: genLine(CX + 40, 40, CX + 40, 180), direction: 'down' },
    ],
    boundingBox: { width: W, height: H },
  },
  't': {
    pinyin: 't',
    strokes: [
      { points: [...genCurve({ x: CX, y: 40 }, { x: CX - 40, y: 80 }, { x: CX, y: 180 })], direction: 'curve' },
      { points: genLine(CX - 40, CY - 30, CX + 40, CY - 30), direction: 'right' },
    ],
    boundingBox: { width: W, height: H },
  },
  'n': {
    pinyin: 'n',
    strokes: [
      { points: genLine(CX - 40, 50, CX - 40, 160), direction: 'down' },
      { points: [...genCurve({ x: CX - 40, y: 50 }, { x: CX, y: 30 }, { x: CX + 40, y: 160 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'l': {
    pinyin: 'l',
    strokes: [
      { points: genLine(CX, 30, CX, 170), direction: 'down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'g': {
    pinyin: 'g',
    strokes: [
      { points: [
        ...genArc(CX - 10, CY - 20, 35, Math.PI * 1.2, Math.PI * 1.8, 15),
        ...genArc(CX - 10, CY, 35, -Math.PI * 0.7, -Math.PI * 1.2, 15),
      ], direction: 'curve-left' },
      { points: [...genCurve({ x: CX + 40, y: 80 }, { x: CX + 30, y: 140 }, { x: CX - 10, y: 180 })], direction: 'curve-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'k': {
    pinyin: 'k',
    strokes: [
      { points: genLine(CX - 30, 40, CX - 30, 170), direction: 'down' },
      { points: [...genLine(CX + 30, 50, CX - 20, 100, 15), ...genLine(CX - 20, 100, CX + 40, 160, 15)], direction: 'angle' },
    ],
    boundingBox: { width: W, height: H },
  },
  'h': {
    pinyin: 'h',
    strokes: [
      { points: genLine(CX - 40, 40, CX - 40, 170), direction: 'down' },
      { points: [...genCurve({ x: CX - 40, y: 70 }, { x: CX, y: 60 }, { x: CX + 30, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'j': {
    pinyin: 'j',
    strokes: [
      { points: [...genCurve({ x: CX + 10, y: 50 }, { x: CX - 10, y: 90 }, { x: CX + 10, y: 180 })], direction: 'curve' },
      { points: [{ x: CX + 10, y: 30 }].concat(genArc(CX + 10, 25, 6, 0, Math.PI * 2, 20)), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'q': {
    pinyin: 'q',
    strokes: [
      { points: [
        ...genArc(CX + 10, CY - 20, 35, Math.PI * 1.2, Math.PI * 1.8, 15),
        ...genArc(CX + 10, CY, 35, -Math.PI * 0.7, -Math.PI * 1.2, 15),
      ], direction: 'curve-right' },
      { points: [...genCurve({ x: CX - 40, y: 80 }, { x: CX - 20, y: 140 }, { x: CX + 20, y: 180 })], direction: 'curve-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'x': {
    pinyin: 'x',
    strokes: [
      { points: genLine(CX - 50, 50, CX + 50, 170), direction: 'diag-down' },
      { points: genLine(CX + 50, 50, CX - 50, 170), direction: 'diag-up' },
    ],
    boundingBox: { width: W, height: H },
  },
  'zh': {
    pinyin: 'zh',
    strokes: [
      { points: genLine(CX - 50, 60, CX - 50, 170), direction: 'down' },
      { points: [...genCurve({ x: CX - 50, y: 60 }, { x: CX - 20, y: 40 }, { x: CX + 10, y: 170 })], direction: 'arc-down' },
      { points: [
        ...genArc(CX + 50, CY - 10, 25, Math.PI * 1.3, Math.PI * 1.8, 12),
        ...genArc(CX + 50, CY + 10, 25, -Math.PI * 0.7, -Math.PI * 1.3, 12),
      ], direction: 'curve-right' },
      { points: genLine(CX + 80, 50, CX + 80, 170), direction: 'down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ch': {
    pinyin: 'ch',
    strokes: [
      { points: [...genCurve({ x: CX - 30, y: 60 }, { x: CX + 10, y: 40 }, { x: CX - 10, y: 170 })], direction: 'curve' },
      { points: genLine(CX - 40, CY - 10, CX + 20, CY - 10), direction: 'right' },
      { points: genLine(CX + 40, 50, CX + 40, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 40, y: 70 }, { x: CX + 70, y: 60 }, { x: CX + 90, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'sh': {
    pinyin: 'sh',
    strokes: [
      { points: [...genCurve({ x: CX - 20, y: 50 }, { x: CX - 60, y: 80 }, { x: CX - 20, y: 170 })], direction: 'curve' },
      { points: [...genCurve({ x: CX - 20, y: 80 }, { x: CX + 20, y: 60 }, { x: CX - 10, y: 120 })], direction: 'cross' },
      { points: genLine(CX + 30, 50, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 70 }, { x: CX + 60, y: 60 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'r': {
    pinyin: 'r',
    strokes: [
      { points: genLine(CX - 20, 50, CX - 20, 170), direction: 'down' },
      { points: [...genCurve({ x: CX - 20, y: 70 }, { x: CX + 10, y: 60 }, { x: CX + 30, y: 100 })], direction: 'curve' },
    ],
    boundingBox: { width: W, height: H },
  },
  'z': {
    pinyin: 'z',
    strokes: [
      { points: genLine(CX - 40, 60, CX + 40, 60), direction: 'right' },
      { points: genLine(CX + 40, 60, CX - 40, 160), direction: 'diag' },
      { points: genLine(CX - 40, 160, CX + 40, 160), direction: 'right' },
    ],
    boundingBox: { width: W, height: H },
  },
  'c': {
    pinyin: 'c',
    strokes: [
      { points: genArc(CX, CY, 50, Math.PI * 0.8, -Math.PI * 0.8, 40), direction: 'curve-left' },
    ],
    boundingBox: { width: W, height: H },
  },
  's': {
    pinyin: 's',
    strokes: [
      { points: [
        ...genArc(CX + 15, CY - 30, 30, Math.PI * 1.1, -Math.PI * 0.6, 20),
        ...genArc(CX - 15, CY + 30, 30, Math.PI * 0.4, -Math.PI * 1.3, 20),
      ], direction: 'wave' },
    ],
    boundingBox: { width: W, height: H },
  },
  'y': {
    pinyin: 'y',
    strokes: [
      { points: genLine(CX - 30, 50, CX, 100), direction: 'diag-down' },
      { points: genLine(CX, 100, CX + 30, 50), direction: 'diag-up' },
      { points: [...genCurve({ x: CX, y: 100 }, { x: CX - 10, y: 140 }, { x: CX + 20, y: 180 })], direction: 'tail' },
    ],
    boundingBox: { width: W, height: H },
  },
  'w': {
    pinyin: 'w',
    strokes: [
      { points: genLine(CX - 70, 50, CX - 40, 160), direction: 'down' },
      { points: genLine(CX - 40, 160, CX - 10, 90), direction: 'up' },
      { points: genLine(CX - 10, 90, CX + 20, 160), direction: 'down' },
      { points: genLine(CX + 20, 160, CX + 50, 50), direction: 'up' },
    ],
    boundingBox: { width: W, height: H },
  },
  'a': {
    pinyin: 'a',
    strokes: [
      { points: [
        ...genArc(CX, CY + 10, 40, Math.PI * 0.3, Math.PI * 1.5, 25),
      ], direction: 'curve' },
      { points: [...genLine(CX + 30, 40, CX + 30, CY - 20, 20), ...genCurve({ x: CX + 30, y: CY - 20 }, { x: CX, y: CY }, { x: CX + 30, y: 170 }, 15)], direction: 'tail-curve' },
    ],
    boundingBox: { width: W, height: H },
  },
  'o': {
    pinyin: 'o',
    strokes: [
      { points: genArc(CX, CY, 50, 0, Math.PI * 2, 50), direction: 'circle' },
    ],
    boundingBox: { width: W, height: H },
  },
  'e': {
    pinyin: 'e',
    strokes: [
      { points: genLine(CX - 40, CY, CX + 40, CY), direction: 'right' },
      { points: [
        ...genArc(CX, CY + 10, 45, Math.PI * 0.2, Math.PI, 25),
        ...genLine(CX - 45, CY + 10, CX + 40, CY + 10, 20),
      ], direction: 'curve-bottom' },
    ],
    boundingBox: { width: W, height: H },
  },
  'i': {
    pinyin: 'i',
    strokes: [
      { points: genLine(CX, 50, CX, 170), direction: 'down' },
      { points: genArc(CX, 30, 8, 0, Math.PI * 2, 20), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'u': {
    pinyin: 'u',
    strokes: [
      { points: [...genCurve({ x: CX - 30, y: 50 }, { x: CX - 30, y: 140 }, { x: CX, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX, 160, CX + 30, 50), direction: 'up' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ü': {
    pinyin: 'ü',
    strokes: [
      { points: [...genCurve({ x: CX - 30, y: 60 }, { x: CX - 30, y: 140 }, { x: CX, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX, 160, CX + 30, 60), direction: 'up' },
      { points: genArc(CX - 25, 35, 7, 0, Math.PI * 2, 15), direction: 'dot' },
      { points: genArc(CX + 25, 35, 7, 0, Math.PI * 2, 15), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ai': {
    pinyin: 'ai',
    strokes: [
      { points: genLine(CX - 70, 50, CX - 70, 170), direction: 'down' },
      { points: [
        ...genArc(CX - 30, CY + 10, 35, Math.PI * 0.3, Math.PI * 1.5, 20),
      ], direction: 'curve' },
      { points: [...genLine(CX, 50, CX, CY - 20, 20), ...genCurve({ x: CX, y: CY - 20 }, { x: CX - 30, y: CY }, { x: CX, y: 170 }, 15)], direction: 'tail' },
      { points: genLine(CX + 50, 60, CX + 50, 170), direction: 'down' },
      { points: genArc(CX + 50, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ei': {
    pinyin: 'ei',
    strokes: [
      { points: genLine(CX - 70, CY, CX - 20, CY), direction: 'right' },
      { points: [
        ...genArc(CX - 45, CY + 15, 30, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: genArc(CX + 30, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ui': {
    pinyin: 'ui',
    strokes: [
      { points: [...genCurve({ x: CX - 70, y: 60 }, { x: CX - 70, y: 140 }, { x: CX - 40, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX - 40, 160, CX - 10, 60), direction: 'up' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: genArc(CX + 30, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ao': {
    pinyin: 'ao',
    strokes: [
      { points: [
        ...genArc(CX - 30, CY + 10, 35, Math.PI * 0.3, Math.PI * 1.5, 25),
      ], direction: 'curve' },
      { points: [...genLine(CX, 40, CX, CY - 20, 20), ...genCurve({ x: CX, y: CY - 20 }, { x: CX - 30, y: CY }, { x: CX, y: 170 }, 15)], direction: 'tail' },
      { points: genArc(CX + 50, CY, 40, 0, Math.PI * 2, 40), direction: 'circle' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ou': {
    pinyin: 'ou',
    strokes: [
      { points: genArc(CX - 40, CY, 35, 0, Math.PI * 2, 40), direction: 'circle' },
      { points: [...genCurve({ x: CX + 10, y: 60 }, { x: CX + 10, y: 140 }, { x: CX + 40, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX + 40, 160, CX + 70, 60), direction: 'up' },
    ],
    boundingBox: { width: W, height: H },
  },
  'iu': {
    pinyin: 'iu',
    strokes: [
      { points: genLine(CX - 50, 60, CX - 50, 170), direction: 'down' },
      { points: genArc(CX - 50, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
      { points: [...genCurve({ x: CX + 10, y: 60 }, { x: CX + 10, y: 140 }, { x: CX + 40, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX + 40, 160, CX + 70, 60), direction: 'up' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ie': {
    pinyin: 'ie',
    strokes: [
      { points: genLine(CX - 60, 60, CX - 60, 170), direction: 'down' },
      { points: genArc(CX - 60, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
      { points: genLine(CX, CY, CX + 60, CY), direction: 'right' },
      { points: [
        ...genArc(CX + 30, CY + 15, 30, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
    ],
    boundingBox: { width: W, height: H },
  },
  'üe': {
    pinyin: 'üe',
    strokes: [
      { points: [...genCurve({ x: CX - 70, y: 60 }, { x: CX - 70, y: 140 }, { x: CX - 40, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX - 40, 160, CX - 10, 60), direction: 'up' },
      { points: genArc(CX - 65, 35, 6, 0, Math.PI * 2, 12), direction: 'dot' },
      { points: genArc(CX - 15, 35, 6, 0, Math.PI * 2, 12), direction: 'dot' },
      { points: genLine(CX + 20, CY, CX + 70, CY), direction: 'right' },
      { points: [
        ...genArc(CX + 45, CY + 15, 25, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
    ],
    boundingBox: { width: W, height: H },
  },
  'er': {
    pinyin: 'er',
    strokes: [
      { points: genLine(CX - 60, CY, CX, CY), direction: 'right' },
      { points: [
        ...genArc(CX - 30, CY + 15, 30, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 80 }, { x: CX + 55, y: 70 }, { x: CX + 70, y: 110 })], direction: 'curve' },
    ],
    boundingBox: { width: W, height: H },
  },
  'an': {
    pinyin: 'an',
    strokes: [
      { points: [
        ...genArc(CX - 40, CY + 10, 35, Math.PI * 0.3, Math.PI * 1.5, 25),
      ], direction: 'curve' },
      { points: [...genLine(CX - 10, 40, CX - 10, CY - 20, 20), ...genCurve({ x: CX - 10, y: CY - 20 }, { x: CX - 40, y: CY }, { x: CX - 10, y: 170 }, 15)], direction: 'tail' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 60 }, { x: CX + 55, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'en': {
    pinyin: 'en',
    strokes: [
      { points: genLine(CX - 60, CY, CX - 10, CY), direction: 'right' },
      { points: [
        ...genArc(CX - 35, CY + 15, 25, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 60 }, { x: CX + 55, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'in': {
    pinyin: 'in',
    strokes: [
      { points: genLine(CX - 50, 60, CX - 50, 170), direction: 'down' },
      { points: genArc(CX - 50, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
      { points: genLine(CX + 20, 60, CX + 20, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 20, y: 60 }, { x: CX + 50, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'un': {
    pinyin: 'un',
    strokes: [
      { points: [...genCurve({ x: CX - 60, y: 60 }, { x: CX - 60, y: 140 }, { x: CX - 30, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX - 30, 160, CX, 60), direction: 'up' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 60 }, { x: CX + 55, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ün': {
    pinyin: 'ün',
    strokes: [
      { points: [...genCurve({ x: CX - 70, y: 60 }, { x: CX - 70, y: 140 }, { x: CX - 40, y: 160 })], direction: 'curve-down' },
      { points: genLine(CX - 40, 160, CX - 10, 60), direction: 'up' },
      { points: genArc(CX - 65, 35, 6, 0, Math.PI * 2, 12), direction: 'dot' },
      { points: genArc(CX - 15, 35, 6, 0, Math.PI * 2, 12), direction: 'dot' },
      { points: genLine(CX + 20, 60, CX + 20, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 20, y: 60 }, { x: CX + 50, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ang': {
    pinyin: 'ang',
    strokes: [
      { points: [
        ...genArc(CX - 50, CY + 10, 30, Math.PI * 0.3, Math.PI * 1.5, 20),
      ], direction: 'curve' },
      { points: [...genLine(CX - 20, 40, CX - 20, CY - 20, 20), ...genCurve({ x: CX - 20, y: CY - 20 }, { x: CX - 50, y: CY }, { x: CX - 20, y: 170 }, 15)], direction: 'tail' },
      { points: genLine(CX + 10, 60, CX + 10, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 10, y: 60 }, { x: CX + 35, y: 40 }, { x: CX + 60, y: 170 })], direction: 'arc-down' },
      { points: genLine(CX + 75, 50, CX + 75, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 75, y: 50 }, { x: CX + 100, y: 30 }, { x: CX + 125, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'eng': {
    pinyin: 'eng',
    strokes: [
      { points: genLine(CX - 60, CY, CX - 10, CY), direction: 'right' },
      { points: [
        ...genArc(CX - 35, CY + 15, 25, Math.PI * 0.2, Math.PI, 20),
      ], direction: 'curve-bottom' },
      { points: genLine(CX + 20, 60, CX + 20, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 20, y: 60 }, { x: CX + 45, y: 40 }, { x: CX + 70, y: 170 })], direction: 'arc-down' },
      { points: genLine(CX + 85, 50, CX + 85, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 85, y: 50 }, { x: CX + 110, y: 30 }, { x: CX + 135, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ing': {
    pinyin: 'ing',
    strokes: [
      { points: genLine(CX - 50, 60, CX - 50, 170), direction: 'down' },
      { points: genArc(CX - 50, 40, 7, 0, Math.PI * 2, 15), direction: 'dot' },
      { points: genLine(CX + 10, 60, CX + 10, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 10, y: 60 }, { x: CX + 35, y: 40 }, { x: CX + 60, y: 170 })], direction: 'arc-down' },
      { points: genLine(CX + 75, 50, CX + 75, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 75, y: 50 }, { x: CX + 100, y: 30 }, { x: CX + 125, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
  'ong': {
    pinyin: 'ong',
    strokes: [
      { points: [
        ...genArc(CX - 40, CY, 35, Math.PI * 0.15, Math.PI * 1.85, 30),
      ], direction: 'curve' },
      { points: genLine(CX + 30, 60, CX + 30, 170), direction: 'down' },
      { points: [...genCurve({ x: CX + 30, y: 60 }, { x: CX + 55, y: 40 }, { x: CX + 80, y: 170 })], direction: 'arc-down' },
    ],
    boundingBox: { width: W, height: H },
  },
};

export function getStrokeData(pinyin: string): WritingStrokeData | null {
  return WRITING_STROKE_DATA[pinyin] || null;
}

export function scaleStrokePoints(
  points: StrokePoint[],
  canvasWidth: number,
  canvasHeight: number,
  dataBox: { width: number; height: number }
): StrokePoint[] {
  const sx = canvasWidth / dataBox.width;
  const sy = canvasHeight / dataBox.height;
  return points.map(p => ({ x: p.x * sx, y: p.y * sy }));
}

export function calculateStrokeSimilarity(
  userPoints: StrokePoint[],
  targetPoints: StrokePoint[],
  threshold: number = 30
): number {
  if (userPoints.length < 3 || targetPoints.length < 3) return 0;

  const sampleSize = 10;
  const sampleUser: StrokePoint[] = [];
  const sampleTarget: StrokePoint[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor((i / (sampleSize - 1)) * (userPoints.length - 1));
    sampleUser.push(userPoints[idx]);
  }
  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor((i / (sampleSize - 1)) * (targetPoints.length - 1));
    sampleTarget.push(targetPoints[idx]);
  }

  let totalDistance = 0;
  for (let i = 0; i < sampleSize; i++) {
    const dx = sampleUser[i].x - sampleTarget[i].x;
    const dy = sampleUser[i].y - sampleTarget[i].y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  const avgDistance = totalDistance / sampleSize;
  const similarity = Math.max(0, 1 - avgDistance / threshold);
  return similarity;
}
