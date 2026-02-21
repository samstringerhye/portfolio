import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const astroDist = path.join(root, 'dist', '_astro')

if (!fs.existsSync(astroDist)) {
  console.error('dist/_astro not found. Run `npm run build` first.')
  process.exit(1)
}

const toKb = (bytes) => bytes / 1024
const round = (n) => Number(n.toFixed(2))

const MAX_SINGLE_JS_KB = Number(process.env.MAX_SINGLE_JS_KB ?? 500)
const MAX_TOTAL_JS_KB = Number(process.env.MAX_TOTAL_JS_KB ?? 950)
const MAX_SINGLE_CSS_KB = Number(process.env.MAX_SINGLE_CSS_KB ?? 80)
const MAX_TOTAL_CSS_KB = Number(process.env.MAX_TOTAL_CSS_KB ?? 160)

function collect(ext) {
  return fs
    .readdirSync(astroDist)
    .filter((f) => f.endsWith(ext))
    .map((name) => {
      const bytes = fs.statSync(path.join(astroDist, name)).size
      return { name, bytes, kb: toKb(bytes) }
    })
    .sort((a, b) => b.bytes - a.bytes)
}

function sumKb(list) {
  return list.reduce((acc, x) => acc + x.kb, 0)
}

const js = collect('.js')
const css = collect('.css')

const totalJsKb = sumKb(js)
const totalCssKb = sumKb(css)
const largestJs = js[0]
const largestCss = css[0]

const errors = []
const warnings = []

if (!js.length) errors.push('No JS assets found in dist/_astro')
if (!css.length) warnings.push('No CSS assets found in dist/_astro')

if (largestJs && largestJs.kb > MAX_SINGLE_JS_KB) {
  errors.push(`Largest JS chunk is ${round(largestJs.kb)} KB (${largestJs.name}), over ${MAX_SINGLE_JS_KB} KB`)
}
if (totalJsKb > MAX_TOTAL_JS_KB) {
  errors.push(`Total JS is ${round(totalJsKb)} KB, over ${MAX_TOTAL_JS_KB} KB`)
}
if (largestCss && largestCss.kb > MAX_SINGLE_CSS_KB) {
  errors.push(`Largest CSS chunk is ${round(largestCss.kb)} KB (${largestCss.name}), over ${MAX_SINGLE_CSS_KB} KB`)
}
if (totalCssKb > MAX_TOTAL_CSS_KB) {
  errors.push(`Total CSS is ${round(totalCssKb)} KB, over ${MAX_TOTAL_CSS_KB} KB`)
}

if (largestJs && largestJs.kb > MAX_SINGLE_JS_KB * 0.9) {
  warnings.push(`Largest JS chunk is nearing limit: ${round(largestJs.kb)} / ${MAX_SINGLE_JS_KB} KB (${largestJs.name})`)
}

console.log('Bundle summary:')
console.log(`- JS files: ${js.length}, total ${round(totalJsKb)} KB, largest ${largestJs ? `${round(largestJs.kb)} KB (${largestJs.name})` : 'n/a'}`)
console.log(`- CSS files: ${css.length}, total ${round(totalCssKb)} KB, largest ${largestCss ? `${round(largestCss.kb)} KB (${largestCss.name})` : 'n/a'}`)

if (warnings.length) {
  console.log('Warnings:')
  for (const w of warnings) console.log(`- ${w}`)
}

if (errors.length) {
  console.error('Bundle size check failed:')
  for (const e of errors) console.error(`- ${e}`)
  process.exit(1)
}

console.log('Bundle size check passed.')
