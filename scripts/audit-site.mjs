import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const srcDir = path.join(root, 'src')
const publicDir = path.join(root, 'public')
const SOURCE_EXTS = new Set(['.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs'])

const errors = []
const warnings = []

function fail(msg) {
  errors.push(msg)
}

function warn(msg) {
  warnings.push(msg)
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'))
}

function walkFiles(dir, predicate) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkFiles(fullPath, predicate))
      continue
    }
    if (entry.isFile() && predicate(fullPath)) out.push(fullPath)
  }
  return out
}

function toRel(filePath) {
  return path.relative(root, filePath)
}

function toSrcRel(filePath) {
  return path.relative(srcDir, filePath).replace(/\\/g, '/')
}

function assertEq(label, actual, expected) {
  if (actual !== expected) {
    fail(`${label}: expected "${expected}", got "${actual}"`)
  }
}

function assertInSet(label, value, set) {
  if (!set.has(value)) {
    fail(`${label}: "${value}" is not in allowed set: [${[...set].join(', ')}]`)
  }
}

function validateContentAndTokens() {
  const tokens = readJson('src/data/tokens.json')
  const home = readJson('src/content/home.json')
  const experience = readJson('src/content/experience.json')

  const roleSet = new Set(Object.keys(tokens.roles))
  const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
  const textTags = new Set(['p', 'span', 'div'])

  // Enforce site-level semantic mapping for this portfolio.
  assertEq('home.hero.headlineTag', home.hero.headlineTag, 'h1')
  assertEq('home.bio.headlineTag', home.bio.headlineTag, 'h2')
  assertEq('home.bio.bodyTag', home.bio.bodyTag, 'p')
  assertEq('home.work.headingTag', home.work.headingTag, 'h2')
  assertEq('home.work.cardTitleTag', home.work.cardTitleTag, 'h3')
  assertEq('home.interests.headingTag', home.interests.headingTag, 'h2')
  assertEq('experience.headingTag', experience.headingTag, 'h2')
  assertEq('experience.jobTitleTag', experience.jobTitleTag, 'h3')
  assertEq('experience.companyTag', experience.companyTag, 'p')

  assertInSet('home.hero.headlineTag', home.hero.headlineTag, headingTags)
  assertInSet('home.bio.headlineTag', home.bio.headlineTag, headingTags)
  assertInSet('home.bio.bodyTag', home.bio.bodyTag, textTags)
  assertInSet('home.work.headingTag', home.work.headingTag, headingTags)
  assertInSet('home.work.cardTitleTag', home.work.cardTitleTag, headingTags)
  assertInSet('home.interests.headingTag', home.interests.headingTag, headingTags)
  assertInSet('experience.headingTag', experience.headingTag, headingTags)
  assertInSet('experience.jobTitleTag', experience.jobTitleTag, headingTags)
  assertInSet('experience.companyTag', experience.companyTag, textTags)

  const roleRefs = [
    ['home.hero.headlineRole', home.hero.headlineRole],
    ['home.bio.headlineRole', home.bio.headlineRole],
    ['home.bio.bodyRole', home.bio.bodyRole],
    ['home.work.headingRole', home.work.headingRole],
    ['home.work.cardTitleRole', home.work.cardTitleRole],
    ['home.interests.headingRole', home.interests.headingRole],
    ['home.interests.textRole', home.interests.textRole],
    ['experience.headingRole', experience.headingRole],
    ['experience.jobTitleRole', experience.jobTitleRole],
    ['experience.companyRole', experience.companyRole],
    ['experience.highlightRole', experience.highlightRole],
  ]

  for (const [label, role] of roleRefs) {
    assertInSet(label, role, roleSet)
  }

  // Ensure metadata role remains less prominent than body copy.
  if (tokens.roles.label?.scale === 'lg' || tokens.roles.label?.scale === 'xl') {
    fail('tokens.roles.label.scale should not be as large as body/lead for metadata hierarchy')
  }
}

function validateStaticReferences() {
  const sourceFiles = walkFiles(srcDir, (file) => {
    const ext = path.extname(file)
    return SOURCE_EXTS.has(ext) || ext === '.md' || ext === '.json'
  })

  const refs = new Set()

  for (const filePath of sourceFiles) {
    const source = fs.readFileSync(filePath, 'utf8')

    let match
    const quoted = /["'`](\/(?:assets|fonts)\/[^"'`\)\s]+)["'`]/g
    while ((match = quoted.exec(source))) refs.add(match[1])

    const markdown = /\]\((\/(?:assets|fonts)\/[^\)\s]+)\)/g
    while ((match = markdown.exec(source))) refs.add(match[1])
  }

  for (const ref of refs) {
    const publicPath = path.join(publicDir, ref.slice(1))
    if (!fs.existsSync(publicPath)) {
      fail(`Missing static asset reference: ${ref}`)
    }
  }
}

function resolveLocalImport(fromAbsPath, specifier) {
  if (!specifier.startsWith('.')) return null

  const base = path.resolve(path.dirname(fromAbsPath), specifier)
  const direct = [base, ...[...SOURCE_EXTS].map((ext) => `${base}${ext}`)]
  for (const candidate of direct) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate
    }
  }

  for (const ext of SOURCE_EXTS) {
    const indexFile = path.join(base, `index${ext}`)
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      return indexFile
    }
  }

  return null
}

function parseSourceRefs(absPath) {
  const source = fs.readFileSync(absPath, 'utf8')
  const specs = []
  let match

  const importExport = /(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g
  while ((match = importExport.exec(source))) specs.push(match[1])

  const dynamicImport = /import\(\s*["'`]([^"'`]+)["'`]\s*\)/g
  while ((match = dynamicImport.exec(source))) specs.push(match[1])

  const scriptSrc = /script\s+src=["'`]([^"'`]+)["'`]/g
  while ((match = scriptSrc.exec(source))) specs.push(match[1])

  return specs
}

function validateNoDeadComponents() {
  const sourceFiles = walkFiles(srcDir, (file) => SOURCE_EXTS.has(path.extname(file)))
  const sourceSet = new Set(sourceFiles.map((f) => toSrcRel(f)))

  const queue = []
  const visited = new Set()

  for (const rel of sourceSet) {
    if (rel.startsWith('pages/') || rel.startsWith('layouts/') || rel === 'content.config.ts') {
      queue.push(rel)
      visited.add(rel)
    }
  }

  while (queue.length) {
    const rel = queue.shift()
    const abs = path.join(srcDir, rel)
    for (const spec of parseSourceRefs(abs)) {
      const resolved = resolveLocalImport(abs, spec)
      if (!resolved) continue
      const resolvedRel = toSrcRel(resolved)
      if (!sourceSet.has(resolvedRel)) continue
      if (visited.has(resolvedRel)) continue
      visited.add(resolvedRel)
      queue.push(resolvedRel)
    }
  }

  const deadComponents = [...sourceSet]
    .filter((rel) => rel.startsWith('components/'))
    .filter((rel) => !visited.has(rel))
    .sort()

  if (deadComponents.length) {
    fail(`Unreferenced components detected: ${deadComponents.join(', ')}`)
  }
}

function extractHeadingLevels(html) {
  const levels = []
  const headingRegex = /<h([1-6])\b[^>]*>/gi
  let match
  while ((match = headingRegex.exec(html))) {
    levels.push(Number(match[1]))
  }
  return levels
}

function validateHtmlOutput() {
  if (!fs.existsSync(distDir)) {
    fail('dist/ not found. Run `npm run build` before running this audit.')
    return
  }

  const htmlFiles = walkFiles(distDir, (file) => file.endsWith('.html'))
  if (!htmlFiles.length) {
    fail('No built HTML files found under dist/')
    return
  }

  for (const filePath of htmlFiles) {
    const rel = toRel(filePath)
    const html = fs.readFileSync(filePath, 'utf8')

    if (!html.includes('class="skip-to-content"') || !html.includes('href="#main"')) {
      fail(`${rel}: missing skip-to-content link`)
    }
    if (!html.includes('<main id="main"')) {
      fail(`${rel}: missing <main id="main"> landmark`)
    }

    if (!html.includes('id="about-modal"') || !html.includes('role="dialog"') || !html.includes('aria-modal="true"')) {
      fail(`${rel}: about modal dialog semantics are incomplete`)
    }

    const levels = extractHeadingLevels(html)
    const h1Count = levels.filter(l => l === 1).length
    if (h1Count !== 1) {
      fail(`${rel}: expected exactly 1 h1, found ${h1Count}`)
    }

    let prev = 0
    for (const level of levels) {
      if (prev > 0 && level > prev + 1) {
        fail(`${rel}: heading level jump detected (h${prev} -> h${level})`)
      }
      prev = level
    }

    const imgRegex = /<img\b[^>]*>/gi
    let imgMatch
    while ((imgMatch = imgRegex.exec(html))) {
      const tag = imgMatch[0]
      if (!/\salt=("[^"]*"|'[^']*')/i.test(tag)) {
        fail(`${rel}: image missing alt attribute -> ${tag.slice(0, 120)}...`)
      }
    }

    const extLinkRegex = /<a\b[^>]*target="_blank"[^>]*>/gi
    let linkMatch
    while ((linkMatch = extLinkRegex.exec(html))) {
      const tag = linkMatch[0]
      if (!/\srel="[^"]*(noopener|noreferrer)[^"]*"/i.test(tag)) {
        fail(`${rel}: target=\"_blank\" link missing rel noopener/noreferrer -> ${tag.slice(0, 120)}...`)
      }
    }
  }
}

function validateMotionCoverage() {
  const motionFiles = [
    'src/layouts/BaseLayout.astro',
    'src/components/HeroSection.astro',
    'src/components/BioSection.astro',
    'src/components/ScrollingInterests.astro',
    'src/components/scroll-reveals.ts',
    'src/components/hover-effects.ts',
    'src/components/WorkCarouselIsland.jsx',
  ]

  for (const rel of motionFiles) {
    const full = path.join(root, rel)
    if (!fs.existsSync(full)) {
      fail(`${rel}: expected motion file is missing`)
      continue
    }

    const src = fs.readFileSync(full, 'utf8')
    if (!src.includes('prefers-reduced-motion')) {
      fail(`${rel}: missing prefers-reduced-motion guard`)
    }
  }

  if (fs.existsSync(distDir)) {
    const cssFiles = fs.readdirSync(path.join(distDir, '_astro')).filter(f => f.endsWith('.css'))
    const css = cssFiles
      .map(f => fs.readFileSync(path.join(distDir, '_astro', f), 'utf8'))
      .join('\n')
    if (!css.includes('@media(prefers-reduced-motion:reduce)')) {
      fail('Built CSS is missing @media(prefers-reduced-motion: reduce) safeguards')
    }
  } else {
    warn('dist/ not found, skipping built CSS reduced-motion validation')
  }
}

validateContentAndTokens()
validateStaticReferences()
validateNoDeadComponents()
validateHtmlOutput()
validateMotionCoverage()

if (warnings.length) {
  console.log('Warnings:')
  for (const w of warnings) console.log(`- ${w}`)
}

if (errors.length) {
  console.error('Site audit failed:')
  for (const e of errors) console.error(`- ${e}`)
  process.exit(1)
}

console.log('Site audit passed:')
console.log('- Semantic hierarchy and heading structure validated')
console.log('- Accessibility connections (main/skip-link/dialog/alt/rel) validated')
console.log('- Reduced-motion coverage validated')
console.log('- Token/content role and tag connections validated')
