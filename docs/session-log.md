# Session Log

## 2026-08-10

**Branch:** main
**Commit:** 0c37fdd Tighten smooth scroll: lerp 0.5, native wheel speed

### Summary

- Fixed the timeline year column in `src/components/Timeline.astro`. Removed the negative `margin-left` and matching `padding-left: var(--page-margin)` on `.tl-year` so the year label starts at the timeline's own left edge instead of bleeding to the viewport edge. Committed as `9707a3d`.
- Tuned Lenis smooth scroll in `src/data/animation.config.json`: `lerp` 0.25 → 0.5 and `wheelMultiplier` 1.4 → 1. The wheel multiplier above 1 was the main source of the floaty feel; 0.5 lerp is the near-native end of the useful range.
- Updated the defaults table in `src/data/animation.config.docs.md` to match the new values.
- Built a dev-only on-screen tuner panel in `BaseLayout.astro` (lerp/wheelMultiplier sliders, Copy JSON button) to dial the values by feel. It initially failed silently because `mountScrollTuner` was declared inside an `if (import.meta.env.DEV)` block and was out of scope at the call site; hoisting the declaration fixed it. Removed before committing.
- Kept scroll values in `animation.config.json` rather than inlining literals in the Lenis constructor, matching where every other animation constant lives.
