import { Vector3 } from 'three'

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

interface GeneratorResult {
  positions: Vector3[]
  distances: number[]
}

export function generateSpiral(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratorResult {
  const positions: Vector3[] = []
  const distances: number[] = []
  const total = numRays * dotsPerRay
  const goldenAngle = TWO_PI / (PHI * PHI)
  for (let i = 0; i < total; i++) {
    const angle = i * goldenAngle
    const r = spacing * Math.sqrt(i)
    const v = new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0)
    positions.push(v)
    distances.push(v.length())
  }
  return { positions, distances }
}

export function generateConcentric(numRays: number, dotsPerRay: number, spacing: number, innerRadius: number): GeneratorResult {
  const positions: Vector3[] = []
  const distances: number[] = []
  for (let ring = 0; ring < dotsPerRay; ring++) {
    const r = innerRadius + ring * spacing
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * TWO_PI
      const v = new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0)
      positions.push(v)
      distances.push(v.length())
    }
  }
  return { positions, distances }
}

export function generateHexagonal(_numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratorResult {
  const positions: Vector3[] = []
  const distances: number[] = []
  const maxR = dotsPerRay * spacing
  const rowH = spacing * Math.sqrt(3) / 2
  const rows = Math.ceil(maxR * 2 / rowH)
  for (let row = -rows; row <= rows; row++) {
    const y = row * rowH
    const offset = (row % 2) * spacing * 0.5
    const cols = Math.ceil(maxR * 2 / spacing)
    for (let col = -cols; col <= cols; col++) {
      const x = col * spacing + offset
      if (x * x + y * y > maxR * maxR) continue
      const v = new Vector3(x, y, 0)
      positions.push(v)
      distances.push(v.length())
    }
  }
  return { positions, distances }
}

export function generateRose(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratorResult {
  const positions: Vector3[] = []
  const distances: number[] = []
  const k = Math.max(2, Math.round(numRays / 20))
  const total = numRays * dotsPerRay
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * TWO_PI * k
    const r = Math.cos(k * theta) * dotsPerRay * spacing * 0.3
    const absR = Math.abs(r)
    const sign = r >= 0 ? 1 : -1
    const v = new Vector3(
      Math.cos(theta) * absR * sign,
      Math.sin(theta) * absR * sign,
      0,
    )
    positions.push(v)
    distances.push(v.length())
  }
  return { positions, distances }
}

export const generators: Record<string, typeof generateSpiral> = {
  spiral: generateSpiral,
  concentric: generateConcentric,
  hexagonal: generateHexagonal,
  rose: generateRose,
}

/** Quadratic Bezier taper for dot sizes across distance */
export function sizeTaper(n: number, sizeStart: number, sizeMid: number, sizeEnd: number): number {
  const inv = 1 - n
  return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
}
