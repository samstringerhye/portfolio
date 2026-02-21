import rawTokens from './tokens.json'
import rawAnimations from './animation.config.json'

// Resolve { $ref: "primitives.color.neutral.900" } → actual value
function getPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

function resolveRefs(node: any, root: any): any {
  if (node === null || node === undefined) return node
  if (typeof node !== 'object') return node
  if ('$ref' in node) return getPath(root, node.$ref)
  if (Array.isArray(node)) return node.map(v => resolveRefs(v, root))
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(node)) {
    out[k] = resolveRefs(v, root)
  }
  return out
}

const resolved = resolveRefs(rawTokens, rawTokens) as typeof rawTokens

export const primitives = resolved.primitives
export const semantic = resolved.semantic
export const roles = resolved.roles
export const hover = resolved.hover

export const prose = resolved.prose
export const animations = resolveRefs(rawAnimations, resolved) as typeof rawAnimations

export const colors = resolved.semantic.color

// CMY color helpers
const cmy = resolved.semantic.color.cmy
function hexToRgb(hex: string) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}
const [cr, cg, cb] = hexToRgb(cmy.cyan)
const [mr, mg, mb] = hexToRgb(cmy.magenta)
const [yr, yg, yb] = hexToRgb(cmy.yellow)

export function cmyRgba(opacity: number): [string, string, string] {
  return [
    `rgba(${cr},${cg},${cb},${opacity})`,
    `rgba(${mr},${mg},${mb},${opacity})`,
    `rgba(${yr},${yg},${yb},${opacity})`,
  ]
}

export default resolved
