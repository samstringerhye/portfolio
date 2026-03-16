# Portfolio Audit Design

**Date:** 2026-03-16
**Goal:** Job-search readiness + design cohesion. Ensure nothing a hiring manager would flag, and everything looks intentional.
**Primary viewport:** Desktop (1440px), mobile spot-check (375px)

## Audit Streams (run in parallel)

### Stream 1: Visual QA (Dogfood)
Every page screenshotted at 1440px desktop + 375px mobile spot check.

**Pages (10+):** Home, Work index, 5 case studies, About, Resume, Contact, Colophon, Blog index, 2 blog posts, 404

**Checks:**
- Layout breaks, overflow, misalignment
- Orphaned words / widows in headlines
- Inconsistent spacing between sections
- Missing or broken images
- Hover/focus state gaps
- Font loading flash (FOIT/FOUT)
- Scroll behavior issues (Lenis, ScrollTrigger)
- Anything that looks unintentional

### Stream 2: Code Consistency
- Token adherence (hardcoded colors/spacing/fonts vs CSS vars)
- Responsive handling (raw px breakpoints vs custom media)
- Heading hierarchy (h1-h3 correct order per page)
- Alt text on all images
- Link hygiene (dead links, external rel attributes)
- Meta/SEO (unique title, description, OG image per page)
- Focus states (visible focus ring on all interactive elements)
- Contrast (WCAG AA: 4.5:1 body, 3:1 large)
- WAB custom hex colors noted but not flagged as violations

### Stream 3: Content & Detail
- Factual consistency (dates, roles, clients across case studies, resume, about)
- Case study claims (no inflated metrics, no vague language)
- Copy tone consistency page to page
- Dead-end UX (clear next actions after case studies)
- Colophon accuracy vs actual tech stack
- Resume to case study alignment

## Output Format

Single findings doc: `docs/plans/2026-03-16-portfolio-audit.md`

| Priority | Meaning |
|----------|---------|
| Critical | Hiring manager notices negatively in under 30 seconds |
| Should fix | Breaks "intentional and cohesive" on closer inspection |
| Nice to have | Polish that elevates but isn't embarrassing if missed |

Each finding: what's wrong, where (file + line or page), recommended fix.
