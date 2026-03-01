# Full Site Audit Report

**Site:** samstringerhye.com (Astro 5 portfolio)
**Date:** 2026-02-28
**Build status:** 9 pages, 66 images, zero build errors
**Files audited:** 42 source files across `src/`, config files, `public/`, `plugins/`

---

## Summary

| Category | Critical | Warning | Info | Total |
|----------|:--------:|:-------:|:----:|:-----:|
| Structure & Architecture | 1 | 3 | 3 | 7 |
| Performance | 1 | 7 | 5 | 13 |
| Accessibility (WCAG 2.1 AA) | 1 | 8 | 3 | 12 |
| SEO | 0 | 5 | 3 | 8 |
| Code Quality | 0 | 15 | 7 | 22 |
| Responsive Design | 0 | 1 | 2 | 3 |
| Browser Compatibility | 0 | 3 | 2 | 5 |
| Security | 0 | 1 | 0 | 1 |
| Content & Copy | 0 | 0 | 1 | 1 |
| **Total** | **3** | **43** | **26** | **72** |

---

## 1. Structure & Architecture

### 1.1 File/Folder Structure

The project is well-organized with a flat `src/components/` directory (25 files), clear separation of pages, layouts, content, and data. No deep nesting.

```
src/
  components/    25 files (.astro, .ts, .jsx)
  content/       home.json, home.schema.json, work/ (4 .mdx)
  data/          tokens.json, tokens.ts, animation.config.*, schemas
  layouts/       BaseLayout.astro, CaseStudyLayout.astro
  pages/         index, about, colophon, 404, work/index, work/[...slug]
  styles/        global.css, custom-media.css
  types/         content.ts, typography.ts
  assets/        Work images (4 project folders)
  lottie/        4 Lottie JSON animations
```

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | **Critical** | `package.json` :11-13 | npm scripts `audit:site`, `perf:check`, and `verify:site` reference `scripts/audit-site.mjs` and `scripts/check-bundle-size.mjs` — both files were deleted in the cleanup. Running these scripts will fail. | Remove the three dead scripts from `package.json`, or recreate the script files. |
| 2 | **Warning** | `src/components/WorkCarousel.astro` :19 | `cardTitleRole = 'display-sm'` references a typescale role that was removed from `tokens.json` during the previous audit. The `.typo-display-sm` CSS class no longer exists. | Change to `cardTitleRole = 'headline-lg'` (the equivalent role that replaced it), or re-add `display-sm` to tokens. |
| 3 | **Warning** | `src/types/typography.ts` :3 | `'display-sm'` still listed in `TYPOGRAPHY_ROLES` array but has no corresponding token entry. | Remove `'display-sm'` from the array. |
| 4 | **Warning** | `src/content/home.schema.json` :13 | `"display-sm"` still listed as valid enum value. | Remove from the schema enum. |
| 5 | **Info** | `src/data/animation.config.docs.md` | Documentation file that describes the animation config system. Not imported anywhere — purely reference. | Keep as documentation. |
| 6 | **Info** | `src/lottie/` | Contains 4 Lottie JSON files (Coin, Confirmation, Intro, Leaf) used by LottiePlayer in case studies. | Correctly placed. |
| 7 | **Info** | `public/fonts/` | Empty directory exists in public/. | Delete if unused, or confirm it serves a purpose. |

---

## 2. Performance

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Critical** | `Timeline.astro` / `LottiePlayer.astro` | 414 / 63 | **Duplicate Lottie bundles:** Timeline imports `lottie-web/build/player/lottie_light` (169KB) while LottiePlayer imports `lottie-web/build/player/lottie_light.min.js` (167KB). Bundler treats these as separate modules → **336KB total, ~167KB wasted**. | Standardize all imports to `lottie-web/build/player/lottie_light` (bundler minifies automatically). |
| 2 | **Warning** | `Lightbox.ts` | 2-3 | GSAP `Flip` plugin imported and registered but **never called** (`Flip.` appears zero times in the file). Adds ~15KB to the Lightbox bundle. | Remove `import { Flip } from 'gsap/Flip'` and `gsap.registerPlugin(Flip)`. |
| 3 | **Warning** | `hover-effects.ts` | 1 | `import gsap from 'gsap'` is imported but **never used** — only CSS transitions are used. | Remove the unused import. |
| 4 | **Warning** | `WorkCarousel.astro` | 59-66 | Carousel images use fixed `width={1600}` with no responsive `sizes` or `srcset`. Mobile downloads a 1600px-wide image for a 375px viewport. | Add `widths={[400, 800, 1200, 1600]}` and `sizes="(max-width: 768px) 100vw, 50vw"`. |
| 5 | **Warning** | Case study `.mdx` files | various | MDX images use raw `<img>` tags (via rehype) — no Astro `<Image>` optimization, no webp conversion, no responsive srcset. | Use Astro's `<Image>` component inside `Figure.astro` or create a custom MDX image component. |
| 6 | **Warning** | `Footer.astro` | 213 | `setInterval` for palette cycling (200ms) has no cleanup on `astro:before-swap`. Runs after page navigation until next `astro:page-load`. | Add `document.addEventListener('astro:before-swap', () => clearInterval(paletteIntervalId))`. |
| 7 | **Warning** | `Lightbox.ts` | 69 | Lightbox overlay DOM element appended to `document.body` but never removed on `astro:before-swap`. May accumulate stale DOM nodes after View Transitions. | Check for existing overlay or remove on `astro:before-swap`. |
| 8 | **Warning** | `CaseStudyLayout.astro` | 861-862 | `initImageCursor` adds mouse listeners on every `astro:page-load` with no dedup guard. | Add `dataset.cursorBound` guard or clean up on `astro:before-swap`. |
| 9 | **Info** | `BaseLayout.astro` | 264 | Google Fonts loads DM Sans (5 weights), Playfair Display (4+2 italic weights), DM Mono (2 weights). May load more weights than needed. | Audit which weights are actually used; trim unused ones. |
| 10 | **Info** | `BaseLayout.astro` | 266 | Large inline `<style>` block with all token CSS vars + typescale. Inlined into every page HTML — not cacheable across navigations. | If exceeds ~5KB, consider extracting to an external stylesheet. |
| 11 | **Info** | `HeroCanvas.jsx` | — | 486KB bundle (gzip 123KB). Three.js + EffectComposer + FXAA + React runtime. | Large but acceptable for a 3D hero. Could reduce by dropping FXAA pass or switching to vanilla Three.js (removing React). |
| 12 | **Info** | `package.json` | 21 | `concurrently` is a production dependency but unused in any npm script. | Move to devDependencies or remove. |
| 13 | **Info** | `BaseLayout.astro` | 198-207 | `roleAliases` generates legacy `.typo-*` classes marked as "migration" aliases. If migration is complete, remove to reduce inline CSS. | Verify no templates use old names, then remove. |

---

## 3. Accessibility (WCAG 2.1 AA)

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Critical** | `global.css` | 93-97 | `:focus-visible` uses `box-shadow` for focus ring but no `outline`. **Windows High Contrast Mode ignores box-shadow** — focus ring invisible for WHCM users. | Add `outline: 2px solid transparent;` alongside `box-shadow: var(--focus-ring)`. WHCM renders outlines. |
| 2 | **Warning** | `tokens.json` | 56-58 | `--color-text-secondary` (`#5A6070`) on `--color-bg-primary` (`#EFF4F5`) = **~3.8:1 contrast ratio**. Fails AA for normal text (4.5:1 required). Passes for large text only. | Darken `neutral.500` to at least `#4A5060` (~4.6:1). |
| 3 | **Warning** | `about.astro` | 44 | `.about-bio` uses `--color-text-secondary` for body paragraphs (the primary about page content). | Use `--color-text-primary` for body text, or fix the secondary color per #2. |
| 4 | **Warning** | `work/index.astro` | 109, 120 | `.work-row-year` and `.work-row-tagline` use `--color-text-secondary` at small text sizes. | Fix per #2. |
| 5 | **Warning** | `404.astro` | 39-43 | `.not-found-link` touch targets are ~32px tall (below 44px minimum). | Add `min-height: var(--touch-target); display: inline-flex; align-items: center;`. |
| 6 | **Warning** | `about.astro` | 59-62 | `.about-link` text links rely on line-height alone (~24px). Below 44px touch target. | Add `padding-block: var(--space-1)` and `min-height: var(--touch-target)`. |
| 7 | **Warning** | `CaseStudyNav.astro` | 70-74 | `.cs-nav-link` may be tight on mobile at `padding: var(--space-2) 0`. | Add `min-height: var(--touch-target)` for mobile. |
| 8 | **Warning** | `Nav.astro` | — | No Escape key handler on `document` when mobile nav is open. If focus is on the toggle button, Escape won't close the nav. | Add document-level Escape listener when nav is open. |
| 9 | **Warning** | `home.json` | 4 | Home page h1 is "Every pixel, on purpose." — a tagline rather than a descriptive heading containing the name or "portfolio" keyword. | Consider a visually hidden descriptive h1 with the name, making the tagline a `<p>`. |
| 10 | **Info** | Various | — | `prefers-reduced-motion` is thoroughly respected across all 13 animation files checked. | Excellent coverage. |
| 11 | **Info** | Various | — | ARIA attributes are correctly used throughout: carousels, lightbox, nav, skip link. | No issues. |
| 12 | **Info** | Various | — | All images have alt text. Heading hierarchy is correct on all pages. | No issues. |

---

## 4. SEO

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Warning** | `work/[...slug].astro` | 30-37 | All case studies share the same generic `og:image` (`/assets/og-image.jpg`). When shared on social media, every case study shows the same preview. | Pass per-project thumbnail as `ogImage` through CaseStudyLayout → SEO.astro. |
| 2 | **Warning** | `work/[...slug].astro` | 30-39 | No `CreativeWork` JSON-LD structured data on case study pages. Only generic Person/WebSite schemas. | Add `schema.org/CreativeWork` with name, description, creator, dateCreated per case study. |
| 3 | **Warning** | `404.astro` | 5 | No `description` prop passed — uses generic default from SEO.astro. | Add `description="Page not found."` to BaseLayout. |
| 4 | **Warning** | `astro.config.mjs` | 11 | No sitemap `filter` — the 404 page is included in `sitemap.xml`. | Add `sitemap({ filter: (page) => !page.includes('/404') })`. |
| 5 | **Warning** | `work/index.astro` | 30 | "View project" link text is generic. Screen readers lack context about which project. | Add `aria-label="View {entry.data.title} project"`. |
| 6 | **Info** | `public/assets/og-image.jpg` | — | OG image is 1200x630px (correct dimensions). | PASS. |
| 7 | **Info** | `SEO.astro` | 20, 49 | Canonical URLs auto-generated correctly. | PASS. |
| 8 | **Info** | `public/robots.txt` | — | Correct `Allow: /` with sitemap reference. | PASS. |

---

## 5. Code Quality

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Warning** | `tokens.ts` | 5, 9, 14 | `any` type used 5 times in `getPath`, `resolveRefs`, and `out` record. | Define a recursive `JsonNode` type. |
| 2 | **Warning** | `BaseLayout.astro` | 31, 44 | `cssVal(val: any)` and `flattenObject(obj: Record<string, any>)`. | Type `val` as `string \| number \| { min: number; max: number }`. |
| 3 | **Warning** | `HeroCanvas.jsx` | various | Zero type annotations — all function parameters untyped. | Convert to `.tsx` or add JSDoc types. |
| 4 | **Warning** | `RGBShutter.astro` | 127 | `const event = e as any` — bypasses type checking. | Use the correct event type. |
| 5 | **Warning** | `WorkCarousel.astro` | 521 | `(carousel as any).__workRo` — monkey-patching DOM elements. Same in `Carousel.astro` :297. | Use a `WeakMap<HTMLElement, ResizeObserver>`. |
| 6 | **Warning** | `Footer.astro` | 11-15, 186 | Hardcoded hex colors (`#24F266`, `#F22434`, `#FBE91E`, `#2471F2`, `#0B0D1B`) don't match token accent colors. | Add to tokens or use CSS custom properties. |
| 7 | **Warning** | `Nav.astro` | 21-24 | SVG logo petal colors hardcoded, don't match token accents. | Document as brand mark colors or add to tokens. |
| 8 | **Warning** | `Nav.astro` | 281 | Hardcoded `'#ffffff'` in GSAP animation. | Use CSS custom property. |
| 9 | **Warning** | `CaseStudyLayout.astro` | 146 | `background: #fff;` hardcoded. | Use `var(--color-bg-primary)`. |
| 10 | **Warning** | `Nav.astro` | 342 | Hardcoded `768px` breakpoint in JS `matchMedia`. Same in `CaseStudyLayout.astro` :710, `HeroCanvas.jsx` :209, `WorkCarousel.astro` :362. | Create a shared JS constant from tokens breakpoints. |
| 11 | **Warning** | `RGBShutter.astro` | 16 | `max-width: 1440px` hardcoded. | Use a token variable. |
| 12 | **Warning** | `BaseLayout.astro` | 323-329 | Three dynamic `import()` calls with no try/catch. If any module fails, interactions break silently. | Wrap in try/catch. |
| 13 | **Warning** | `HeroCanvas.jsx` | 195-327 | No error boundary around Three.js setup. | Wrap in try/catch, set `webglSupported = false` on failure. |
| 14 | **Warning** | `CaseStudyLayout.astro` | 751 | `canvas.getContext('2d')!` non-null assertion. Can return null. | Add null check. |
| 15 | **Warning** | `BaseLayout.astro` | 341 | Dead code: `if (!bar) { bar && gsap.set(bar, ...) }` — the `bar &&` inside `if (!bar)` is always false. | Simplify to `if (!bar) return`. |
| 16 | **Info** | `tokens.ts` | 56-57 | `cmyRgba` deprecated in favor of `accentRgba` but still used in Nav, Footer, Timeline, WorkCarousel. | Complete the migration. |
| 17 | **Info** | `LottiePlayer.astro` | 29, 69, 102 | `console.warn` in catch blocks. Reasonable for non-critical component. | Optionally wrap in `import.meta.env.DEV`. |
| 18 | **Info** | `WorkCarousel.astro` | 115 | Custom visually-hidden pattern instead of using `.visually-hidden` utility. | Use the global utility class. |
| 19 | **Info** | `Lightbox.ts` → `PascalCase` vs `hover-effects.ts` → `kebab-case` | — | Inconsistent `.ts` file naming. | Standardize to one convention. |
| 20 | **Info** | `WorkCarousel.astro` | 293 | Dot transition uses hardcoded `0.3s ease`. | Use `var(--duration-long)`. |
| 21 | **Info** | Various Timeline, WorkCarousel, HeroSection, BioSection | — | `as any` for dynamic Astro tag names — an Astro framework limitation. | Acceptable workaround; document. |
| 22 | **Info** | `global.css` | 167-199 | `.grid-overlay` debug grid always rendered in DOM. | Wrap in `import.meta.env.DEV` check or remove for production. |

---

## 6. Responsive Design

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Warning** | `WorkCarousel.astro` | 362 | JS uses `cw <= 768` hardcoded breakpoint. | Import from tokens or use shared constant. |
| 2 | **Info** | `custom-media.css` | 1-5 | Only 3 breakpoints (480, 768, 1024px). No large breakpoint for 1440px layouts. | Consider adding `--4x: 1280px` if needed. |
| 3 | **Info** | Various | — | `@media (--2x)` custom media used consistently across components. | Good consistency. |

---

## 7. Browser Compatibility

| # | Severity | File | Line | Description | Fix |
|---|----------|------|------|-------------|-----|
| 1 | **Warning** | `custom-media.css` | — | `@custom-media` is Stage 2 CSS, not natively supported. Relies on PostCSS plugin. | Verified: `postcss-custom-media` is configured in `postcss.config.mjs`. Working correctly. |
| 2 | **Warning** | Multiple files | — | `subgrid` used in Timeline, CaseStudyLayout, CaseStudyNav, about, work/index. Not supported in Safari < 16 (Sept 2022). | Acceptable for modern portfolio. Add fallback if analytics show older Safari traffic. |
| 3 | **Warning** | `CaseStudyLayout.astro`, `global.css` | 250, 178 | `:has()` selector not supported in Firefox < 121 (Dec 2023). | Add `@supports selector(:has(*))` guards if needed. |
| 4 | **Info** | `global.css` | 35, 39 | `text-wrap: balance` and `text-wrap: pretty` — Safari < 17.4 / Firefox < 121. | Progressive enhancement — text wraps normally without it. |
| 5 | **Info** | `global.css` | 15 | `overflow-x: clip` — supported since 2022. | No action needed. |

---

## 8. Security

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | **Warning** | `package-lock.json` | `rollup` 4.0.0-4.58.0 has a **high severity** vulnerability (arbitrary file write via path traversal — GHSA-mw96-cpmx-2vgc). | Run `npm audit fix` to update rollup. |
| — | **Pass** | `src/` | No API keys, secrets, passwords, or tokens found in source code. | — |
| — | **Pass** | Root | No `.env` files present. | — |
| — | **Pass** | Various | All external links use `rel="noopener noreferrer"`. | — |

---

## 9. Content & Copy

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| — | **Pass** | All pages | No lorem ipsum or placeholder text found. | — |
| — | **Pass** | All pages | No TODO/FIXME/HACK comments in source. | — |
| — | **Pass** | All links | All `href` values point to valid internal routes or external URLs. Resume PDF confirmed accessible at `/assets/resume.pdf`. | — |
| 1 | **Info** | `public/fonts/` | Empty directory in public/ — may confuse contributors. | Delete if unused. |

---

## Top 10 Priority Fixes

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | **Critical** | Duplicate Lottie bundles (~167KB wasted) | Performance — unnecessary JS shipped |
| 2 | **Critical** | Focus ring invisible in Windows High Contrast Mode | A11y — WCAG failure for WHCM users |
| 3 | **Critical** | Dead npm scripts reference deleted files | DX — `npm run verify:site` crashes |
| 4 | **Warning** | `--color-text-secondary` fails AA contrast | A11y — 3.8:1 ratio, needs 4.5:1 |
| 5 | **Warning** | `display-sm` typescale role removed but still referenced | Visual — missing CSS class on carousel titles |
| 6 | **Warning** | Unused Flip import in Lightbox (~15KB) + unused gsap in hover-effects | Performance — dead code shipped |
| 7 | **Warning** | No responsive srcset on carousel images | Performance — oversized images on mobile |
| 8 | **Warning** | Case studies share one OG image | SEO — poor social media previews |
| 9 | **Warning** | Touch targets below 44px on 404 and About links | A11y — hard to tap on mobile |
| 10 | **Warning** | Rollup high-severity vulnerability | Security — needs `npm audit fix` |

---

*Audit complete — checked 72 elements across 42 source files.*
