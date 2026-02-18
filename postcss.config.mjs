import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import postcssGlobalData from '@csstools/postcss-global-data'
import postcssCustomMedia from 'postcss-custom-media'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tokens = JSON.parse(readFileSync(join(__dirname, 'src/data/tokens.json'), 'utf-8'))

// Generate @custom-media declarations from tokens.breakpoints
const declarations = Object.entries(tokens.breakpoints)
  .map(([key, val]) => `@custom-media --${key} (max-width: ${val}px);`)
  .join('\n')

// Write to a generated CSS file that postcss-global-data can read
const generatedDir = join(__dirname, 'src/styles')
const generatedPath = join(generatedDir, 'custom-media.css')
writeFileSync(generatedPath, `/* Auto-generated from tokens.json — do not edit */\n${declarations}\n`)

export default {
  plugins: [
    postcssGlobalData({ files: [generatedPath] }),
    postcssCustomMedia(),
  ],
}
