export interface GeneratedGeometry {
  posX: Float32Array
  posY: Float32Array
  dist: Float32Array
  total: number
}

export type ArrangementGenerator = (
  numRays: number,
  dotsPerRay: number,
  spacing: number,
  innerRadius: number,
) => GeneratedGeometry

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

export function roundedSquareWave(t: number, delta: number, amplitude: number, frequency: number): number {
  return ((2 * amplitude) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * frequency) / delta)
}

export function generateSpiral(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  const goldenAngle = TWO_PI / (PHI * PHI)
  for (let i = 0; i < total; i++) {
    const angle = i * goldenAngle
    const r = spacing * Math.sqrt(i)
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    posX[i] = x
    posY[i] = y
    dist[i] = Math.sqrt(x * x + y * y)
  }
  return { posX, posY, dist, total }
}

export function generateConcentric(numRays: number, dotsPerRay: number, spacing: number, innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  let idx = 0
  for (let ring = 0; ring < dotsPerRay; ring++) {
    const r = innerRadius + ring * spacing
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * TWO_PI
      posX[idx] = Math.cos(angle) * r
      posY[idx] = Math.sin(angle) * r
      dist[idx] = r
      idx++
    }
  }
  return { posX, posY, dist, total }
}

export function generateHexagonal(_numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const maxR = dotsPerRay * spacing
  const rowH = spacing * Math.sqrt(3) / 2
  const rows = Math.ceil(maxR * 2 / rowH)
  const tmpX: number[] = [], tmpY: number[] = [], tmpD: number[] = []
  for (let row = -rows; row <= rows; row++) {
    const y = row * rowH
    const offset = (row % 2) * spacing * 0.5
    const cols = Math.ceil(maxR * 2 / spacing)
    for (let col = -cols; col <= cols; col++) {
      const x = col * spacing + offset
      const d2 = x * x + y * y
      if (d2 > maxR * maxR) continue
      tmpX.push(x)
      tmpY.push(y)
      tmpD.push(Math.sqrt(d2))
    }
  }
  return {
    posX: new Float32Array(tmpX),
    posY: new Float32Array(tmpY),
    dist: new Float32Array(tmpD),
    total: tmpX.length,
  }
}

export function generateRose(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  const k = Math.max(2, Math.round(numRays / 20))
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * TWO_PI * k
    const r = Math.cos(k * theta) * dotsPerRay * spacing * 0.3
    const absR = Math.abs(r)
    const sign = r >= 0 ? 1 : -1
    const x = Math.cos(theta) * absR * sign
    const y = Math.sin(theta) * absR * sign
    posX[i] = x
    posY[i] = y
    dist[i] = Math.sqrt(x * x + y * y)
  }
  return { posX, posY, dist, total }
}

export function sizeTaper(n: number, sizeStart: number, sizeMid: number, sizeEnd: number): number {
  const inv = 1 - n
  return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
}

export function updateDots(
  matArr: Float32Array, total: number,
  posX: Float32Array, posY: Float32Array, dist: Float32Array,
  dotScales: Float32Array, time: number,
  waveSpeed: number, propagation: number, waveSharpness: number,
  waveAmplitude: number, waveFrequency: number, baseScale: number, twistAmount: number,
): void {
  for (let i = 0; i < total; i++) {
    const d = dist[i]
    const t = time * waveSpeed - d / propagation
    const wave = roundedSquareWave(t, waveSharpness + (0.2 * d) / 50, waveAmplitude, waveFrequency)
    const scale = wave + baseScale
    const tw = wave * twistAmount
    const px = posX[i] * scale
    const py = posY[i] * scale
    const cosT = Math.cos(tw)
    const sinT = Math.sin(tw)
    const s = dotScales[i]
    const o = i * 16
    matArr[o] = s
    matArr[o + 5] = s
    matArr[o + 10] = s
    matArr[o + 12] = px * cosT - py * sinT
    matArr[o + 13] = px * sinT + py * cosT
  }
}
