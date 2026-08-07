# UI/UX Review Synthesis

**Review date:** 2026-08-06
**Target:** samstringerhye.com (localhost:4321)
**Persona:** Creative director or hiring manager evaluating design craft
**Flows:** Homepage → case study → contact; work index browsing; secondary pages
**Viewports:** Desktop (1440px), Mobile (390px)
**Lenses run:** Journey, Visual, Interaction States, Heuristics+WCAG

---

## Overview

24 screenshots captured across 12 pages at 2 viewports. Four lenses produced 66 raw findings. After deduplication (13 findings flagged by 2+ lenses merged), 47 unique findings remain.

**By severity:** 5 blocker, 14 major, 18 minor, 10 polish.

**Top 3 highest-impact issues (flagged by 3 lenses each):**
1. Hero section is blank/invisible until JS loads — no name, no title, no fallback
2. Password gate is a dead end — no nav, no brand, no context, no access instructions
3. Accent colors fail WCAG contrast when used as text on the light background

---

## Blocker (5)

| # | Finding | Lenses | Location |
|---|---------|--------|----------|
| B1 | Hero text invisible until JS executes. opacity:0 in CSS, waits for idle callback + font load + GSAP chain. No name or title visible above the fold in any static context. | Journey, Visual, Interaction | HeroSection.astro:81, homepage |
| B2 | Contact form has no per-field validation. Uses novalidate, shows only generic "Please fill in all fields", no aria-invalid, no email format check. | Interaction, Heuristics | contact.astro:167-170 |
| B3 | Accent hover text colors fail WCAG 1.4.3. Red 3.17:1, green 2.38:1, blue 2.99:1 on #EFF4F5. Applied globally to link hover. | Heuristics, A11y audit | global.css:71-80 |
| B4 | Prose links have no underline or non-color differentiator. Violates WCAG 1.4.1 — links indistinguishable from body text in blog, case studies, colophon. | Heuristics, A11y audit | global.css:66-69 |
| B5 | Lightbox has no image error handling. Broken source shows empty dark overlay with no feedback or recovery path. | Interaction | Lightbox.ts:166-197 |

## Major (14)

| # | Finding | Lenses | Location |
|---|---------|--------|----------|
| M1 | Password gate is a dead end. No nav, no footer, no project name, no instructions for requesting access, no brand presence. | Journey, Visual, Interaction | middleware.ts:61-178 |
| M2 | No inline CTA after case studies. Highest-engagement moment has no "Get in touch" prompt. Relies entirely on nav/footer. | Journey | case study pages |
| M3 | Carousel cards lack client name and year metadata. Work index shows these; homepage carousel doesn't. | Journey | WorkCarousel.astro |
| M4 | About page too thin for 13+ years of experience. No design philosophy, no client list, no cross-link to work. | Journey, Visual | about.astro |
| M5 | Lightbox has no loading state. No spinner or placeholder while full-res image loads; user sees empty dark overlay. | Interaction | Lightbox.ts:166-197 |
| M6 | Contact form unusable without JS. No action attribute, no noscript fallback. | Interaction | contact.astro |
| M7 | Password gate has no rate limiting. Unlimited brute-force attempts accepted. | Interaction | middleware.ts |
| M8 | Password gate has no submit loading state. No button disable, double-submit possible. | Interaction | middleware.ts |
| M9 | Error text uses #FF3B4A at 3.17:1 contrast on both contact form and password gate. | Heuristics | contact.astro, middleware.ts |
| M10 | Password gate input has no label element or aria-label. Placeholder only. | Heuristics | middleware.ts:170 |
| M11 | Interests marquee is the largest type on the homepage — inverts visual hierarchy. Least important content has most visual weight. | Visual | ScrollingInterests.astro |
| M12 | Career timeline uses only 25% of page width on desktop. 75% dead space. | Visual | Timeline.astro, homepage |
| M13 | Case study prev/next links show bare text with no thumbnail or teaser. Low incentive to continue. | Journey | CaseStudyLayout.astro |
| M14 | Mobile homepage shows truncated "Th" text fragment from bio section. Broken reveal animation at-rest state. | Visual | BioSection.astro, homepage mobile |

## Minor (18)

| # | Finding | Lenses |
|---|---------|--------|
| m1 | Blog/Writing section has 2 posts (one placeholder "More to come") — reads as abandoned | Journey, Visual |
| m2 | Contact page has no visible email address or alternative to the form | Journey |
| m3 | Footer lacks Work/About/Resume links — only conversion links | Journey |
| m4 | CVS case study hero cyan breaks visual continuity with every other page | Visual |
| m5 | Carousel images have no loading placeholder (blank gray before load) | Interaction |
| m6 | Hero canvas WebGL fallback gradient is too subtle — featureless 87vh | Interaction |
| m7 | LottiePlayer shows empty container on load error | Interaction |
| m8 | Lightbox has no swipe gesture on mobile | Interaction |
| m9 | Scroll reveals flash visible-to-hidden-to-visible during deferred JS load | Interaction |
| m10 | Password gate focus-visible missing on button and back link | Heuristics |
| m11 | Carousel inactive dots at opacity 0.3 fail 3:1 non-text contrast (WCAG 1.4.11) | Heuristics |
| m12 | Footer LinkedIn link opens new tab with no indication | Heuristics |
| m13 | Contact form error message is generic, doesn't identify which field | Heuristics |
| m14 | External links have no screen-reader indication of new-tab behavior | Heuristics |
| m15 | No visible breadcrumbs on case study pages (JSON-LD only) | Heuristics |
| m16 | Timeline job highlights only accessible via mouse hover, not keyboard | Heuristics |
| m17 | WorkCarousel mobile has no visible swipe affordance (no peek, no hint) | Interaction |
| m18 | Colophon section heading hierarchy is flat — title and sections at similar size | Visual |

## Polish (10)

| # | Finding | Lenses |
|---|---------|--------|
| p1 | Contact form has no character limit feedback on textarea | Interaction |
| p2 | Page transition has no fallback if shutter element lost during navigation | Interaction |
| p3 | Carousel dots not clickable — missed interaction opportunity | Interaction, Heuristics |
| p4 | Nav entrance delay leaves nav invisible briefly on slow connections | Interaction |
| p5 | Contact form button goes from "Sending..." directly to "Send message" with no "Sent" confirmation | Interaction |
| p6 | Footer logo mark layout differs from nav logo mark (vertical vs 2x2) | Visual |
| p7 | MyFrontier has unexplained red color blocks near page bottom | Visual |
| p8 | Contact form styling is generic — missed craft opportunity | Visual |
| p9 | Resume "Download PDF" button cramped on mobile | Visual |
| p10 | Password gate loads its own Google Fonts, disconnected from site font system | Interaction |

---

## Recommended Fix Priority

**Sprint 1 (ship-blockers, ~1 day):**
- B1: Make hero text visible by default, animate as enhancement
- B3+B4: Darken accent text colors, add underlines to prose links
- B2: Add per-field form validation with aria-invalid
- B5: Add onerror handler to lightbox image

**Sprint 2 (major UX gaps, ~2 days):**
- M1: Add nav/brand/context to password gate page
- M2: Add inline CTA after case study content
- M3: Add client/year metadata to carousel cards
- M4: Expand about page content
- M5: Add lightbox loading indicator
- M9+M10: Fix error text contrast, add label to password input

**Sprint 3 (refinement, ~2 days):**
- M6-M8: Progressive form enhancement, password gate rate limiting
- M11-M14: Marquee scale, timeline layout, prev/next enrichment, mobile bio fix
- Minor issues as capacity allows
