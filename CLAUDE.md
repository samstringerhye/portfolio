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

Portfolio site for Sam Stringer-Hye, an Associate Design Director at Razorfish (10+ years experience). The project is in an **active prototyping/pre-build phase** — content has been extracted from an existing Squarespace site, and a new custom-built site is being developed with interactive prototypes.

## Repository Structure

```
src/
  components/              — All components flat (20 files: .astro, .jsx, .ts, .js)
    Nav.astro, Footer.astro, AboutModal.astro, SEO.astro
    HeroSection.astro, BioSection.astro, WorkCarousel.astro
    Timeline.astro, ScrollingInterests.astro, ResumeLink.astro
    CaseStudyHero.astro, CaseStudyNav.astro
    HeroCanvas.jsx         — R3F hero (client:only="react")
    WorkCarouselIsland.jsx — GSAP carousel (client:visible)
    TuningPanel.jsx        — Dev-only tuning overlay
    store.js, heroSchema.js — Zustand tuning store
    about-modal.ts, hover-effects.ts, scroll-reveals.ts
  content/                 — Astro content collections (work, blog, home.md)
  layouts/                 — BaseLayout, CaseStudyLayout, BlogLayout
  pages/                   — Astro routes (index, work/[slug], blog, 404, etc.)
  styles/                  — Global CSS, variables, typography, utilities, case-study
  experience.json          — Timeline data

inputs/
  markdown/                — Case study and resume source content (5 files)
  images/                  — ~154 image assets (png, jpg, webp, gif, jpeg, psd)

prototypes/                — Vite + React app with hash-based routing (#/hero, #/carousel, etc.)
  src/
    prototypes/            — Individual prototype components (7 routes)
    shared/                — OGL renderer, hooks, GLSL shaders
    tunables/              — Live-tuning system (Zustand + localStorage)
  r3f-hero/                — Separate Vite + R3F sub-project

tokens.json                — Design tokens (typography, colors, animation, layout, breakpoints)
package.json               — Root: Astro site
```

## Case Studies

| Project | Client | Role | Year |
| --- | --- | --- | --- |
| Samsung Bespoke Design Studio | Samsung | Assoc. Design Director | 2024 |
| MyFrontier App Redesign | Frontier | Assoc. Design Director | 2024 |
| Samsung.com Redesign | Samsung | Senior Designer | 2023 |
| CVS Shop Website Redesign | CVS | Assoc. Design Director | 2023 |

## Content Conventions

- Markdown files reference images via relative paths: `../images/[filename]`
- Case studies follow a consistent structure: hero image, title, intro paragraph, metadata line (Client / Role / Agency / Year), challenge section, approach/wireframes, outcome with metrics
- Image filenames are derived from Squarespace CDN URL paths with `__` as path separators
- Thumbnail images use `[project]_thumbnail.jpeg` naming with companion `.psd` source files

## Tech Stack

- **Framework**: Astro 5 (static site) with React 19 islands
- **3D/WebGL**: Three.js + R3F + Drei (hero), OGL (prototypes)
- **Animation**: GSAP (ScrollTrigger, Draggable), Lenis (smooth scroll)
- **State**: Zustand (tuning system with localStorage persistence)
- **Build**: Astro (main site), Vite 6 (prototypes app)

## Available Tools & Skills

### MCP Servers (configured)

- **gsap-master** — GSAP animation code generation, debugging, optimization, production patterns
- **claude-in-chrome** — Browser automation, screenshot capture, GIF recording, console debugging (load via ToolSearch before use)
- **pencil** — .pen file design tool (not needed for this project)
- **figma** — Figma integration (not needed for this project)

### Installed Claude Code Skills (~/.claude/skills/)

**Three.js / WebGL / 3D (14 skills)**

- `react-three-fiber` — R3F patterns, Drei helpers, postprocessing, physics, state management
- `threejs-fundamentals` — Scene setup, cameras, renderer, Object3D hierarchy
- `threejs-geometry` — Built-in shapes, BufferGeometry, custom geometry, instancing
- `threejs-materials` — PBR, basic/phong/standard, shader materials
- `threejs-lighting` — Light types, shadows, environment lighting, IBL
- `threejs-textures` — UV mapping, environment maps, cubemaps, HDR
- `threejs-animation` — Keyframe, skeletal, morph targets, animation mixing
- `threejs-loaders` — GLTF/GLB loading, texture loading, async patterns
- `threejs-shaders` — GLSL, ShaderMaterial, uniforms, custom effects
- `threejs-postprocessing` — EffectComposer, bloom, DOF, screen effects, custom passes
- `threejs-interaction` — Raycasting, controls, mouse/touch input
- `webgpu-threejs-tsl` — WebGPU renderer, TSL shading language, compute shaders, WGSL

**Utility**

- `skill-lookup` — Search/install skills from prompts.chat
- `prompt-lookup` — Prompt discovery

### Available Skills (invoke via Skill tool)

**Design & Frontend**

- `frontend-design-pro:design-wizard` — Full interactive design process (trends → moodboard → colors/fonts → code)
- `frontend-design-pro:trend-researcher` — Dribbble/design community trend research
- `frontend-design-pro:analyze-site` / `inspiration-analyzer` — Analyze competitor sites for colors, fonts, patterns
- `frontend-design-pro:moodboard-creator` — Synthesize design direction from collected inspiration
- `frontend-design-pro:color-curator` — Browse/select palettes from Coolors
- `frontend-design-pro:typography-selector` — Browse Google Fonts / curated pairings
- `frontend-design-pro:review` — Design anti-pattern/a11y review
- `frontend-design:frontend-design` — Production-grade frontend code with high design quality
- `all-skills:canvas-design` — Create visual art/assets in .png and .pdf
- `all-skills:image-enhancer` — Upscale/sharpen screenshots and images
- `all-skills:theme-factory` — Apply consistent theming across artifacts
- `all-skills:artifacts-builder` — Complex multi-component HTML artifacts (React, Tailwind, shadcn/ui)

**Three.js / 3D**

- All 12 `threejs-*` and `react-three-fiber` skills listed above (auto-loaded from ~/.claude/skills/)
- `threejs-ecs:code-standards` — Three.js/ECS code quality review

**Next.js (if chosen as framework)**

- `nextjs-expert:scaffold` — Scaffold components
- `nextjs-expert:app-router` — Routes, layouts, loading states
- `nextjs-expert:server-components` — RSC patterns, client vs server
- `nextjs-expert:server-actions` — Form handling, mutations
- `nextjs-expert:route-handlers` — API routes, REST endpoints
- `nextjs-expert:auth-patterns` — Authentication patterns
- `nextjs-expert:optimize` — Performance analysis

**Development & Testing**

- `all-skills:webapp-testing` — Playwright browser testing
- `feature-dev:feature-dev` — Guided feature development with architecture focus
- `code-review:code-review` — Pull request code review
- `all-skills:changelog-generator` — Generate changelogs from git commits
- `all-skills:mcp-builder` — Build custom MCP servers
- `all-skills:skill-creator` — Create new Claude skills

**Productivity / Wolf Framework**

- `wolf-core:wolf-session-init` — Multi-agent session framework
- `productivity:coding-patterns` — Clean code patterns (orchestration, composition, vertical slice)
- `productivity:code-standards` — YAGNI, DRY, SRP review on branch diffs

### Relevant Agents (via Task tool)

- `agents-design-experience:ui-ux-designer` — Design decisions, layout
- `agents-design-experience:accessibility-specialist` — WCAG compliance, a11y audit
- `ui-designer:ui-designer` — UI component building
- `feature-dev:code-architect` — Architecture planning
- `feature-dev:code-reviewer` — Code review
- `code-simplifier` — Code cleanup

### Skills Marketplaces (for finding more)

- skillfish CLI: `npx skillfish search <query>`
- SkillsMP: https://skillsmp.com/
- SkillHub: https://www.skillhub.club
- MCP Market: https://mcpmarket.com/tools/skills
- Anthropic Official: https://github.com/anthropics/skills

## Current State

- **Framework**: Astro (static site) with React islands for interactive components
- **Flat structure**: `src/` has 5 top-level folders (`components/`, `content/`, `layouts/`, `pages/`, `styles/`) — zero nesting inside `components/`
- **Prototypes app** — Vite + React with 7 routes, OGL shader system, Zustand tunables (separate from main site)
- Content is ready, design tokens defined, interaction patterns being explored

## Commands

- `npm run dev` — Start Astro dev server
- `npx astro build` — Production build (static output to `dist/`)
- `cd prototypes && npm run dev` — Prototypes app (Vite, port 3000)
- `cd prototypes/r3f-hero && npm run dev` — R3F hero sub-project
