# Design & Development Retrospective — Portfolio Site

A chronological breakdown of how Sam Stringer-Hye's portfolio went from a Squarespace extraction to a custom-built Astro site over ~36 sessions and 27 commits across two weeks.

---

## Phase 1 — Squarespace Extraction & Initial Scaffolding
**Pre-history → Feb 15, 2026**

The project started with content extracted from an existing Squarespace site: 5 markdown files (4 case studies + a resume) and ~154 raw images with Squarespace CDN-derived filenames. Before the first commit, the Astro project was already standing with a full component hierarchy organized in nested subdirectories (`global/`, `home/`, `work/`, `islands/`, `tunables/`, `scripts/`, `data/`).

**First major decision: flatten the structure.** The very first commit (`8326e7a`) eliminated all nested subdirectories, moving 25 components into a single flat `src/components/` folder. This was a deliberate choice — with ~20 components, nesting added navigational overhead without organizational benefit. Import paths across 7 files were updated, build verified.

The same day, project infrastructure was committed: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tokens.json`, public assets, and `.gitignore`. Raw Squarespace-named images were cleaned up and replaced with organized files under `public/assets/work/[project]/`.

**Tech stack at this point:** Astro 5, React 19 islands (HeroCanvas.jsx with Three.js + R3F, WorkCarouselIsland.jsx with GSAP Draggable), Zustand tuning system (TuningPanel.jsx + store.js + heroSchema.js), ad-hoc CSS tokens.

**Pages:** index, work/[slug], blog, blog/[slug], playground, uses, colophon, 404.

---

## Phase 2 — Typography System & Scope Reduction
**Feb 17, 2026**

A pivotal session that set the design direction. Two major decisions:

**Decision: JSON-driven typography.** Instead of handwritten CSS variables, a `typography.json` file was created defining fonts, weights, scale steps, semantic roles (`display`, `headline`, `title`, `subtitle`, `lead`, `body`, `label`, `caption`), and element-to-tag mappings. CSS utility classes (`.typo-*`) were generated at build time from this JSON. This became the seed of the design token system.

**Decision: PP Editorial New + PP Neue Montreal.** The font selection landed on these two PP families — a display serif paired with a versatile sans. 18 PP trial fonts were added and a `FontSwitcher.astro` component was built for live comparison. This component was later removed once the decision was locked.

**Decision: kill non-portfolio pages.** Blog, playground, and uses pages were removed. The reasoning: focus the build on what matters for a design director's portfolio — case studies and craft. No blog, no playground. The nav simplified to three items: Home, Work, About.

---

## Phase 3 — Single Source of Truth: tokens.json
**Feb 18, 2026**

Two cleanup commits in quick succession completed the design system consolidation. The three separate config files (`typography.json`, `animations.json`, `tokens.css`) were merged into a single `tokens.json`. `BaseLayout.astro` was updated to generate ALL CSS custom properties from this file at build time — zero runtime cost.

**Key validation:** A browser computed-style audit was run across 226 text elements. Every single one was confirmed to use `.typo-*` classes from the token system. No rogue font declarations.

Additional cleanup: `home.md` converted to `home.json`, FontSwitcher removed, unused font files culled, config files moved from `src/content/` to `src/data/` (separating Astro content collections from plain config data). PostCSS was configured.

---

## Phase 4 — Prototyping & Debugging
**Feb 21, 2026**

A "1:1 GitHub backup" commit tracked essentially everything (fonts, build output, editor config), then immediately reversed by removing 54 debug screenshots. During this period, the first real debugging sessions happened — a text wrapping issue in `BioSection.astro` where "digital" was breaking to the second line due to CSS container width calculations.

Skills were installed via Smithery CLI: `anthropics/frontend-design` and `martinholovsky/gsap`. The prototypes app (separate Vite + React + OGL project at `/prototypes/`) was already running but didn't see major changes.

---

## Phase 5 — Case Study Architecture & ProseGroup Pattern
**Feb 23–27, 2026 (captured in daily backup commits)**

The most intensive development period. Multiple sessions daily, captured by automated midnight/midday backup commits.

**Key invention: ProseGroup pattern.** Case study pages used CSS grid where each MDX top-level element became its own bordered cell. Headings and paragraphs rendered as visually fragmented boxes. A `<ProseGroup>` wrapper component was built to collapse heading + paragraph clusters into a single grid cell. All four MDX case study files were updated.

**Case study narrative restructuring.** All four case studies were normalized to a consistent skeleton:
- Hero image + title + metadata bar
- Challenge/problem section
- Approach/wireframes
- Interface design / implementation
- Outcome with metrics
- What I Learned

This was a content architecture decision, not just cosmetic. Each study was reordered and sections were renamed for consistency.

**Multi-agent parallel audit.** A full design audit was kicked off using 5 parallel agents covering: technical architecture, design system consistency, copy quality, case study structure, and performance. The audit report gated further implementation on Sam's approval.

---

## Phase 6 — The Big Audit Implementation
**Feb 28, 2026**

Three commits in one day implementing the full audit results:

**Accessibility overhaul (`af423c5`):**
- Lightbox gained `role="dialog"`, `aria-modal`, focus trap, focus restore, keyboard image activation, `aria-live` counter
- Mobile nav links got `tabindex=-1` when closed (preventing tabbing to hidden items)
- Timeline wrapped in semantic `ul/li` with visually-hidden year labels for screen readers
- `prefers-reduced-motion` applied to Nav petal animation and Footer palette cycle
- `noscript` fallback added for hero canvas
- Skip link updated to use `:focus-visible`
- Carousel got `aria-roledescription="carousel"`

**Memory leak fixes:**
- Footer `setInterval` cleared on re-init during page transitions
- ScrollProgress trigger killed before recreating (preventing accumulation)

**Design consistency:**
- `--max-content-width` extracted as a CSS token (was hardcoded in 4 files)
- `typo-ui-caps` now auto-applies `text-transform: uppercase`
- Lightbox buttons standardized to `var(--touch-target)` size
- `backdrop-filter` blur uses a token value
- Hardcoded `#fff` replaced with `var(--color-bg-primary)` throughout
- Bio `bodyTag` changed from `h3` to `p` (was semantically wrong — a paragraph, not a heading)
- Dead CSS removed from case study layout

**Cursor decision:** `cursor: none` (with custom cursor overlay) was changed to `cursor: zoom-in` / `cursor: grab`. The custom cursor was visually nice but broke the fundamental UX expectation of seeing a cursor. Standard CSS cursors communicate affordance without JavaScript.

---

## Phase 7 — UI Polish & Copy Pass
**Feb 28 → Mar 1, 2026**

A broad sweep of UI and content refinement:

**Dot grid animation rethink.** The original SVG `<pattern>` approach for the animated dot grid in ScrollingInterests was replaced with a CSS `radial-gradient`. Simpler, fewer DOM elements, same visual.

**CaseStudyNav restructure.** Changed from a two-column layout to a single flex row with prev/next links and "All work" right-aligned. Hover underlines removed from nav links.

**Copy rewrite.** About page headline and bio rewritten for more personality. Tighter prose across all pages.

**Grid overlay fix (`7154073`).** Grid overlay lines (the 12-column visual guide) were breaking in production. Fixed immediately after the overhaul commit.

---

## Phase 8 — Typography Consolidation & Dual Scale
**Mar 1, 2026**

**Decision: remove ALL legacy type aliases.** The old role names (`typo-display`, `typo-body`, `typo-ui`, `typo-heading-sm`, `typo-subhead`, `typo-label`) were finally killed. Every component was migrated to the full token-generated role system (`typo-display-lg`, `typo-body-md`, `typo-ui-caps`, etc.).

**New capability: `textTransform` in tokens.** The typography generator was extended to support `textTransform` per role, so `ui-caps` could auto-apply `text-transform: uppercase` without a separate CSS rule.

**Dual modular scale: 1.25x mobile / 1.333x desktop.** The type scale was made responsive. Title scales (`title-lg`, `title-sm`) became fluid via `clamp()`. This ensured readable type at every breakpoint without manual media queries.

---

## Phase 9 — Carousel Drag Rebuild
**Mar 1, 2026**

**Pivot: GSAP Observer → native pointer events.** This was a significant technical pivot. The GSAP Observer-based carousel drag had reliability issues — it wasn't consistently distinguishing drag from click, causing card links to fire during swipes.

The fix: replace the entire drag system with native `pointerdown` / `pointermove` / `pointerup` events on both `Carousel.astro` and `WorkCarousel.astro`.

Key technical decisions:
- `setPointerCapture` deferred until drag is confirmed (movement threshold), so card clicks still work
- All custom cursor systems removed (`img-cursor`, `work-drag-cursor`)
- Standard `grab` / `grabbing` CSS cursors used instead
- Carousel snap point deduplication fixed so the last slide is reachable

This was a case of the CLAUDE.md principle in action: "Favor rebuilding over patching." After a couple of attempts to fix Observer's behavior, the decision was to scrap it and go native.

---

## Phase 10 — Deployment & Copy Audit
**Mar 1, 2026**

**Cloudflare Workers deployment.** Configuration added via a separate branch, merged as PR #1. The site targets Cloudflare's edge network.

**Dedicated copy quality audit.** A separate worktree branch ran a targeted copy audit:
- 36 em dashes replaced with colons, commas, periods, or restructured sentences (6 intentional uses preserved)
- "mental model of the whole journey" phrase deduplicated in Bespoke case study
- GNB description deduplicated across 3 Samsung sections
- "leverage" and "capacity" replaced with plain language in CVS
- "at scale" cut from `home.json`

---

## Phase 11 — Final Audit & Cleanup
**Mar 1, 2026 (continued)**

This session continued with:

1. **Carousel dot dividers** — Added `border-top` rules above dot indicators on both `Carousel.astro` and `WorkCarousel.astro`
2. **Nav Work link** — Changed from `/#selected-work` anchor to `/work` page link
3. **Work page zigzag redesign** — ~15 iterations of the work index page layout. Started as a simple vertical stack, progressed through multiple column configurations (8-col, 10-col), added zigzag alternating image/text rows, struggled with subgrid alignment, settled on a 10-column centered zigzag with `headline-sm` titles and springy hover effects
4. **Grid system audit** — Found duplicate 12-column grids in multiple files. Established `<main class="grid-12">` as the single source of truth with components using `subgrid`. Timeline's 13-column grid (auto year column + 12) was accepted as a justified exception
5. **About modal → page** — Converted the `AboutModal` dialog component to a standalone `/about` page. Removed modal JS (focus trap, scroll lock, escape key), changed the nav button to a link. Dead code deleted
6. **Bio section 50/50** — Changed `grid-template-columns: auto auto 1fr` to `1fr auto 1fr` for equal left/right columns
7. **Mobile hover removal** — Wrapped all non-button CSS hovers in `@media (hover: hover)` and guarded JS `mouseenter`/`mouseleave` handlers with `window.matchMedia('(hover: hover)').matches` across 10 files
8. **Timeline mobile redesign** — Kept the year column visible on mobile (changed from `display: none` to a 2-column grid: `auto 1fr`), disabled hover effects with `pointer-events: none`
9. **Full site audit** — Launched parallel agents to audit semantics, a11y, performance, content, tokens, animations, UX, and code quality. Produced a prioritized 6-tier plan covering 40+ items, all implemented and verified

---

## Key Technical Challenges & How They Were Resolved

| Challenge | What happened | Resolution |
|---|---|---|
| **Zigzag layout breaking** | Setting `.work-index` as a 12-col grid made articles render as grid items instead of stacking | Switched to `subgrid` with `grid-column: 1 / -1` on each row |
| **Double padding** | Work page had its own `padding-inline` on top of `<main class="grid-12">`'s padding | Removed, let subgrid inherit parent padding |
| **Hover shadow clipping** | `overflow: hidden` on `.work-row-image` clipped the `box-shadow` on hover | Moved shadow to container, removed `overflow: hidden`, used `border-radius: inherit` on img |
| **Carousel drag vs click** | GSAP Observer couldn't reliably distinguish drag from click — links fired during swipes | Rebuilt with native pointer events + deferred `setPointerCapture` |
| **Custom cursor UX** | `cursor: none` with JS overlay looked cool but confused users | Reverted to standard CSS `cursor: zoom-in` / `grab` |
| **Lottie bundle size** | `import lottie from 'lottie-web'` loaded the full 304KB build eagerly on every home page | Changed to dynamic import of `lottie-web/build/player/lottie_light` triggered by IntersectionObserver |
| **Grid system fragmentation** | 3 files had their own independent 12-col grids | Audited and consolidated to single `grid-12` on `<main>` with components using subgrid |
| **Mobile hover stickiness** | Touch devices triggered `:hover` states that stuck on tap | Wrapped in `@media (hover: hover)` and JS `matchMedia` guards |
| **Type scale redundancy** | 4 pairs of identical typescale tokens discovered during audit | Merged duplicates, migrated all references |
| **Em dash overuse** | Copy read as AI-generated due to excessive em dash usage | Dedicated copy audit: 36 em dashes replaced, 6 intentional uses kept |

---

## Design Decisions & Their Rationale

| Decision | Rationale |
|---|---|
| **Flat component structure** | ~20 components don't need subdirectories; navigational overhead > organizational benefit |
| **JSON-driven tokens** | Single source of truth (`tokens.json`) generates CSS vars at build time — zero runtime cost, one file to update |
| **PP Editorial New + PP Neue Montreal** | Strong serif/sans pairing with enough weights for the full typographic hierarchy |
| **Kill blog/playground/uses** | A design director's portfolio should focus on case studies and craft, not dilute with content that won't be maintained |
| **ProseGroup pattern** | CSS grid turned every MDX element into an isolated bordered cell — ProseGroup clusters related content into a single visual unit |
| **Native pointer events over GSAP Observer** | Observer was unreliable for drag/click distinction; native events gave precise control over the interaction threshold |
| **Standard cursors over custom overlays** | `cursor: none` breaks the fundamental contract of mouse interaction; affordance > aesthetics |
| **Subgrid architecture** | One grid system (`grid-12` on `<main>`) with components using `subgrid` ensures column alignment without independent grid definitions |
| **`@media (hover: hover)` guards** | Touch devices trigger sticky hover states; the media query is the cleanest way to scope hover-only effects to pointer devices |
| **Cloudflare Workers** | Edge deployment for a static site — fast global CDN with no server to manage |

---

## Project Evolution: What the Site "Is"

The project went through a clear maturation arc:

1. **Extraction** (pre-Feb 15) — Raw content dump from Squarespace
2. **Scaffolding** (Feb 15-18) — Astro structure, flat components, token system, font selection
3. **Content architecture** (Feb 23-27) — Case study narrative patterns, ProseGroup, consistency audit
4. **Quality pass** (Feb 28) — Accessibility, memory leaks, design consistency, cursor UX
5. **Polish** (Mar 1) — Typography consolidation, carousel rebuild, copy audit, mobile refinements
6. **Final audit** (Mar 1) — Full 40-item audit implemented and verified across 6 priority tiers

The site moved from "content exists in a framework" to "every pixel, on purpose" — which is exactly the tagline on the hero.

---

*36 sessions. 27 commits. ~20 components. 4 case studies. 1 flat folder.*
