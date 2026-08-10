# Portfolio

Sam Stringer-Hye's design portfolio. Astro, deployed to Cloudflare.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run preview  # serve the build locally
npm run deploy   # push to Cloudflare
```

`npm run cf-typegen` regenerates Cloudflare binding types after changing `wrangler`
config.

## Layout

- `src/pages/` — routes.
- `src/content/` + `src/content.config.ts` — case studies and other collections, typed
  through Astro's content layer.
- `src/components/`, `src/layouts/`, `src/styles/` — the usual Astro split.
- `src/lottie/`, `src/assets/` — motion and image assets. GSAP drives the scripted
  animation.
- `src/middleware.ts` — request middleware.
- `docs/` — working notes and design decisions.

## Writing

Copy rules live in `AGENTS.md` and apply to anything user-facing, not just agent-written
text. The short version: lead with the outcome, cut adjectives that do not carry weight,
and include real metrics or none.

Motion respects `prefers-reduced-motion`. Keep it that way.
