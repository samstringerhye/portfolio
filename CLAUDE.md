# CLAUDE.md

## How to Work

**Favor rebuilding over patching.** If something isn't working after a couple of attempts, say so and propose a different approach rather than accumulating workarounds.

**Nothing is locked in.** This project is in active prototyping. If a different library, framework, or approach would be a better fit, recommend it.

**Use your tools.** You have MCP servers, skills, and agents available — lean on them rather than coding from memory. Look things up before implementing. Check what's already in the project before adding new dependencies.

**This is a designer's portfolio.** The quality bar is high. Give honest feedback when something doesn't look right — I'd rather hear it early. Respect `prefers-reduced-motion`.

**Ask before making large structural changes.** Refactors, new dependencies, file reorganization — check first. Don't delete or overwrite files without confirming.

***Completion Check*** When asked to audit or check consistency across the codebase, always: (1) list every file you will check before starting, (2) process each file completely, (3) output a summary table of all elements checked with pass/fail status, (4) explicitly confirm "audit complete — checked X elements across Y files" when done.

---

## Project Overview

Portfolio site for **Sam Stringer-Hye**, an Associate Design Director at Razorfish (10+ years experience). The project is in an **active prototyping/build phase** — content has been extracted from an existing Squarespace site, and a new custom-built site is being developed. The site is live at `samstringerhye.com`.

---

## Repository Structure

```
src/
  assets/
    work/                    — Optimized images per case study (Astro image pipeline)
      bespoke-design-studio/ — 25 images (png, jpg, webp)
      cvs-redesign/          — 10 images
      myfrontier-app/        — 6 + screens/ subfolder (15 mobile screens)
      samsung-redesign/      — 15 images
  components/                — Flat directory, 27 files (.astro, .jsx, .ts)
    Layout:      Nav.astro, Footer.astro, AboutModal.astro, SEO.astro
    Homepage:    HeroSection.astro, BioSection.astro, WorkCarousel.astro,
                 Timeline.astro, ScrollingInterests.astro
    Case study:  CaseStudyNav.astro, HeroImage.astro, Meta.astro,
                 Figure.astro, ImagePair.astro, ImageGrid.astro,
                 Carousel.astro, ProseGroup.astro, ZigzagSection.astro,
                 AccentBand.astro, LottiePlayer.astro
    Interactive: HeroCanvas.jsx (R3F hero — client:only="react")
                 RGBShutter.astro (page transition effect)
    Scripts:     about-modal.ts, hover-effects.ts, scroll-reveals.ts,
                 cmy-animate.ts, webgl-hover-effect.ts, Lightbox.ts
  content/                   — Astro content collections
    work/                    — 4 case study MDX files
    home.json                — Homepage content (sections, copy, experience jobs, interests)
    home.schema.json         — JSON schema for home.json
  content.config.ts          — Collection definitions with Zod schemas
  data/                      — Design tokens & animation config
    tokens.json              — Full design token system (ref/sys/elementMap layers)
    tokens.schema.json       — JSON schema for tokens
    tokens.ts                — Token resolver (resolves $ref pointers, exports typed helpers)
    animation.config.json    — Animation parameters (hero, text reveals, timeline, scroll)
    animation.config.schema.json
    animation.config.docs.md — Animation config documentation
  layouts/
    BaseLayout.astro         — Root layout: token→CSS var generation, Lenis, GSAP init
    CaseStudyLayout.astro    — Case study wrapper: lightbox, image cursor, scroll progress
  lottie/                    — Lottie animation JSON files (4 files)
  pages/
    index.astro              — Homepage
    work/[...slug].astro     — Dynamic case study routes
    colophon.astro           — Site credits / tech stack page
    404.astro                — Not found page
  styles/
    global.css               — Reset, grid system, section rules, utilities, reduced motion
    custom-media.css         — Auto-generated breakpoint @custom-media from tokens
  types/
    content.ts               — HomeContent, ExperienceJob interfaces
    typography.ts            — TypographyRole, HeadingTag, TextTag types

fonts/                       — Source font files (not deployed — reference only)
  Fontwerk_Trial_Fonts/      — Trial fonts from Fontwerk foundry
  PP Frama, PP Monument, PP Mori, PP Neue Corp, PP Watch — Pangram Pangram trial fonts

public/
  assets/
    og-image.jpg             — Open Graph image
    resume.pdf               — Downloadable resume
    save_icon.json           — Lottie save icon
    trial/                   — Trial font files
  fonts/                     — Web font files served statically
  favicon.svg                — SVG favicon
  robots.txt                 — Search engine directives

scripts/
  audit-site.mjs             — Post-build site audit (checks links, images, tokens usage)
  check-bundle-size.mjs      — Bundle size limits (JS: 500KB single / 950KB total, CSS: 80KB / 160KB)

plugins/
  rehype-lazy-images.mjs     — Rehype plugin: adds loading="lazy" decoding="async" to images

dist/                        — Built static output (gitignored in practice)
portfolio-backup/            — Backup of earlier site version
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Astro 5 | Static site with React islands, MDX content |
| **UI Islands** | React 19 | `client:only="react"` for 3D, `client:visible` for carousels |
| **3D / WebGL** | Three.js 0.170 + R3F | Hero canvas (`HeroCanvas.jsx`), WebGL hover effects |
| **Animation** | GSAP 3.12 (ScrollTrigger, SplitText) | Text reveals, timeline hovers, scroll-driven effects |
| **Smooth Scroll** | Lenis 1.1 | Integrated with GSAP ticker, respects `prefers-reduced-motion` |
| **Icons** | astro-icon + Iconify | Material Symbols, Simple Icons |
| **Lottie** | lottie-web | Used in MyFrontier case study |
| **CSS** | PostCSS (custom-media, global-data) | `@custom-media` breakpoints from tokens |
| **Fonts** | Google Fonts (DM Sans, Playfair Display, DM Mono) | Loaded via `<link>` in BaseLayout |
| **View Transitions** | Astro View Transitions | `<ViewTransitions fallback="swap" />` |
| **Deployment** | Vercel | Static output |

---

## Design Token System

Tokens live in `src/data/tokens.json` with a **three-layer Material Design 3-aligned architecture**:

1. **`ref`** (reference/primitive) — raw values: font scales, colors, spacing, breakpoints, motion, elevation
2. **`sys`** (system/semantic) — references to `ref` values via `{ "$ref": "ref.color.neutral.900" }` notation
3. **`elementMap`** — maps HTML elements (`h1`–`h6`, `p`, `li`) to typescale roles

`src/data/tokens.ts` resolves all `$ref` pointers at build time and exports typed helpers:
- `ref`, `sys`, `elementMap` — direct token access
- `accentRgba(opacity)` — returns `[string, string, string]` for the three accent colors
- `animations` — resolved animation config
- `colors` — shorthand for `sys.color`

**BaseLayout.astro** generates all CSS custom properties at build time from tokens (no separate CSS variables file needed). All spacing, typography, color, and motion values flow from `tokens.json`.

### Key Token Values

- **Fonts**: DM Sans (body), Playfair Display (display/headlines), DM Mono (code)
- **Colors**: Dark neutrals (#0B0D1B, #1A1D2E), light backgrounds (#EFF4F5, #DAE5E7), three accents (red #FF3B4A, green #00E676, blue #448AFF)
- **Typography scale**: 15 named roles from `display-lg` down to `label-sm`, fluid clamped sizes
- **Breakpoints**: `--1x` (480px), `--2x` (768px), `--3x` (1024px) via `@custom-media`
- **Spacing**: 8 steps, steps 4–8 use fluid `clamp()` between min/max rem values

---

## Content Architecture

### Homepage (`src/content/home.json`)

All homepage copy is centralized in `home.json` with typed interfaces (`src/types/content.ts`). Each section specifies:
- Text content
- HTML tag to render (`headlineTag`, `bodyTag`)
- Typography role class (`headlineRole`, `bodyRole`)
- Optional content inset (`sm` | `md` | `lg`)

Experience/timeline data (job history) is embedded in `home.json` under `experience.jobs[]`.

### Case Studies (`src/content/work/*.mdx`)

Astro content collection with Zod-validated frontmatter:

```yaml
title: string
client: string
year: number
role: string
agency: string
tagline: string
thumbnail: image()      # Astro image reference
heroImage: image()      # Astro image reference
heroImageAlt: string
featured: boolean       # default false
sortOrder: number       # default 999 — controls display order
tags: string[]          # optional
```

Case study MDX files import layout components:
- `HeroImage` — full-width hero image
- `Meta` — metadata bar (client, role, agency, year)
- `ProseGroup` — text blocks within 8/12 column grid
- `ImagePair` — two images side by side with slot-based left/right
- `Carousel` — GSAP Draggable horizontal image carousel
- `Figure` — single image with optional caption
- `ImageGrid` — n-column image grid (default 2)
- `ZigzagSection` — alternating image/text two-column layout
- `AccentBand` — full-width colored section (accent 1/2/3)
- `LottiePlayer` — Lottie animation embed

Images are referenced from `src/assets/work/[project-slug]/` using Astro's image optimization pipeline.

| Case Study | Client | Slug | Sort Order |
|---|---|---|---|
| Samsung Bespoke Design Studio | Samsung | `bespoke-design-studio` | 1 |
| MyFrontier App Redesign | Frontier | `myfrontier-app` | 2 |
| Samsung.com Redesign | Samsung | `samsung-redesign` | 3 |
| CVS Shop Website Redesign | CVS | `cvs-redesign` | 4 |

---

## Key Architectural Patterns

### CSS Custom Properties from Tokens

`BaseLayout.astro` has ~270 lines of build-time JavaScript that:
1. Reads resolved tokens from `src/data/tokens.ts`
2. Generates CSS custom properties for every token category
3. Generates `.typo-*` utility classes from the typescale
4. Generates element-level base styles from `elementMap`
5. Injects all of this as an inline `<style>` tag

**Never hardcode colors, spacing, or font sizes.** Always use CSS variables (`--color-*`, `--space-*`, `--text-*`, etc.) or `typo-*` classes.

### Grid System

- 12-column grid via `.grid-12` on `<main>`
- Subgrid used in case study body for nested alignment
- Page margin: `--page-margin` (fluid, from tokens)
- Content inset levels: `--content-inset-sm/md/lg`
- Persistent vertical guide lines via `.grid-overlay`
- Section dividers via `.section-rule` with crosshair marks

### View Transitions & Client-Side Init

The site uses Astro View Transitions. All client-side initialization handles both initial load and navigation:

```ts
// Pattern used throughout:
initMyFeature()
document.addEventListener('astro:after-swap', handleAfterSwap)
document.addEventListener('astro:page-load', handlePageLoad)
```

- `astro:after-swap` — reinitialize Lenis, refresh ScrollTrigger
- `astro:page-load` — reinitialize scroll reveals, hover effects, lightbox

### Animation System

Animation parameters are centralized in `src/data/animation.config.json` and resolved through `tokens.ts`:

- **Text reveals** (`cmy-animate.ts`, `scroll-reveals.ts`) — GSAP SplitText word-by-word reveals with CMY color offset effect
- **Hero canvas** (`HeroCanvas.jsx`) — R3F spiral dot pattern with wave animation
- **Timeline hover** (`Timeline.astro`) — GSAP expand/collapse with accent color wipe
- **Work hover** (`webgl-hover-effect.ts`) — WebGL RGB channel displacement on thumbnail hover
- **Page transitions** (`RGBShutter.astro`) — RGB band shutter effect between pages
- **Smooth scroll** — Lenis with configurable lerp and wheel multiplier

All animations respect `prefers-reduced-motion: reduce`.

### React Islands

Only one React component (`HeroCanvas.jsx`) is hydrated:
- Uses `client:only="react"` (no SSR, rendered entirely on client)
- R3F scene with instanced mesh, custom wave shader
- Reads animation config from tokens

---

## Commands

```bash
# Development
npm run dev                    # Astro dev server (default port 4321)

# Production build
npm run build                  # Equivalent to `astro build` → outputs to dist/

# Preview production build
npm run preview                # Astro preview server

# Quality checks
npm run audit:site             # Post-build audit (requires dist/)
npm run perf:check             # Bundle size check (requires dist/)
npm run verify:site            # Build + audit + perf check in sequence
```

---

## File Naming Conventions

- **Components**: PascalCase `.astro` or `.jsx` (e.g., `WorkCarousel.astro`, `HeroCanvas.jsx`)
- **Client scripts**: kebab-case `.ts` (e.g., `scroll-reveals.ts`, `hover-effects.ts`)
- **Content files**: kebab-case `.mdx` matching the slug (e.g., `bespoke-design-studio.mdx`)
- **Asset images**: kebab-case, organized by project slug under `src/assets/work/[slug]/`
- **Data files**: kebab-case `.json` with companion `.schema.json` for validation

---

## Important Implementation Details

- **No separate CSS variables file** — all custom properties are generated inline by `BaseLayout.astro` from `tokens.json`
- **`custom-media.css` is auto-generated** — produced by `postcss.config.mjs` from token breakpoints; do not edit manually
- **GSAP is SSR-excluded** — configured as `ssr.noExternal: ['gsap']` in `astro.config.mjs`
- **Images use Astro's pipeline** — case study images imported from `src/assets/` get optimized; `public/` assets are served as-is
- **Markdown images get lazy loading** — the `rehype-lazy-images` plugin adds `loading="lazy" decoding="async"` to all `<img>` tags in MDX
- **Remark unwrap images** — `remark-unwrap-images` removes wrapping `<p>` tags from standalone images in markdown
- **Max body width** — `1440px + 4rem`, centered with `margin-inline: auto`
- **TypeScript strict mode** — extends `astro/tsconfigs/strict`, JSX configured for React

---

## Available Tools & Skills

### MCP Servers (configured)

- **gsap-master** — GSAP animation code generation, debugging, optimization, production patterns
- **claude-in-chrome** — Browser automation, screenshot capture, GIF recording, console debugging

### Installed Claude Code Skills (~/.claude/skills/)

**Three.js / WebGL / 3D (14 skills)**

- `react-three-fiber` — R3F patterns, Drei helpers, postprocessing, physics
- `threejs-fundamentals` through `threejs-postprocessing` — Scene setup, geometry, materials, lighting, textures, animation, loaders, shaders, postprocessing, interaction
- `webgpu-threejs-tsl` — WebGPU renderer, TSL shading language

**Utility**
- `skill-lookup` / `prompt-lookup` — Search and install skills

### Available Skills (invoke via Skill tool)

**Design & Frontend**
- `frontend-design-pro:*` — Design wizard, trend research, site analysis, moodboards, color palettes, typography, review
- `frontend-design:frontend-design` — Production-grade frontend code
- `all-skills:canvas-design` / `image-enhancer` / `theme-factory` / `artifacts-builder`

**Development & Testing**
- `all-skills:webapp-testing` — Playwright browser testing
- `feature-dev:feature-dev` — Guided feature development
- `code-review:code-review` — Pull request code review

### Relevant Agents (via Task tool)

- `agents-design-experience:ui-ux-designer` — Design decisions, layout
- `agents-design-experience:accessibility-specialist` — WCAG compliance, a11y audit
- `feature-dev:code-architect` — Architecture planning
- `feature-dev:code-reviewer` — Code review
