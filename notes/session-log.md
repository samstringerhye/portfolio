## 2026-08-17

**Branch:** main
**Commit:** d4296bf Rebuild Amica case study: real design-system evidence, dropped fabricated diagrams

### Summary

- Tuned the Amica case study hero mosaic (`HeroMosaic.astro`): replaced placeholder "reasons to believe" stat copy, stacked and centered the stat numbers, fixed a clipped "Get A Quote" macro tile, bumped every sub-10px text element for legibility, and fixed a stats-card overflow bug on mobile.
- Audited the case study against portfolio best practices: content was uneven across sections and over-reliant on fabricated data-viz diagrams instead of real artifacts.
- Pulled real visual proof via Figma MCP (Buttons/Icon Buttons design-system documentation) and a live amica.com screenshot (legacy pre-redesign site), and used them to replace `ButtonSystem.astro`, `IconVariantMorph.astro`, `CanvasInkSpecimen.astro`, `TeamOwnership.astro`, and `MigrationPipeline.astro` — all deleted.
- Created `src/styles/amica-tokens.css` as a single source of truth for Amica's real brand colors/fonts; repointed `TokenTiers.astro` and `BeforeAfterStats.astro` to import it instead of locally redefining the same hex values.
- Rebalanced case study prose: thickened the thin "Leading Six Designers" and "Outcomes" sections with real sourced material from `notes/amica-case-study-research.md` (leadership rescue framing, scope-authority conflict, a11y watchdog, governance-at-scale numbers).
- Ran the `no-ai-slop` skill against the case study copy and fixed all findings: removed 3 em dashes (hard AGENTS.md rule), cut stacked "not X, Y" binary contrasts and a fake-profound kicker ending, replaced "highest-leverage" (banned word family) with "biggest-impact".
- Found and deleted duplicate/orphaned assets: `prototype/home-desktop.png` (byte-identical dupe of `hero.png`), `hero/auto.svg` (dupe of `bento/product-auto.svg`), and the orphaned `HeroConfigurations.astro` component that only that svg was used by.
- Fixed a real CSS specificity bug in `CaseStudyLayout.astro`: a broad `:not()`-chain default-image rule was unintentionally outranking the `.image-grid img` containment rule sitewide; wrapped the `:not()` clauses in `:where()` to fix it, and added a caption/image divider rule so figure captions no longer render inside the same bordered box as the image (verified other case studies unaffected).
