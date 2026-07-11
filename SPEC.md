# Pokédex — build spec (follow EXACTLY; do not substitute libraries or features)

You are building a polished, animated **Pokédex** web app that consumes the public **PokeAPI** (`https://pokeapi.co/api/v2`, no key). Build the FULL spec below, test it live with screenshots, deploy it to GitHub Pages, and make it score well on Lighthouse. Work autonomously to completion.

## Definition of DONE (all must be true)

1. All pages/features below implemented and working.
2. `npm run build` succeeds (static, for Pages). `npm run test` (unit + e2e) passes.
3. Lint (oxlint) + format (oxfmt) clean; typecheck clean; lefthook hooks installed.
4. Pushed to the git remote (given below); GitHub Actions CI is green; the **live GitHub Pages URL loads and works**.
5. Lighthouse (run via chrome-devtools MCP `lighthouse_audit` on the built app): **≥90 on Performance, Accessibility, Best-Practices, SEO** (optimize until met or clearly documented why a metric can't be hit).
6. A **"wow" README.md** — the GitHub repo should look genuinely impressive: title + tagline, status/tech **badges** (SvelteKit, TS, Tailwind, CI status, Pages), a **live-demo link** at the top, embedded **screenshots** (put PNGs from your Playwright captures in `docs/screenshots/` and reference them), a features list, tech-stack section, "run locally" instructions, and a short **architecture** overview. Plus a `docs/` folder with at least: `ARCHITECTURE.md` (data flow, caching, route structure) and `DECISIONS.md` (why each pinned choice). Make it portfolio-quality.

## Tech stack — PINNED (do not change)

- **SvelteKit** (latest, Svelte 5 runes) + **TypeScript** (strict).
- **@sveltejs/adapter-static** — SPA mode: `fallback: '404.html'`, `prerender` the static routes; dynamic detail routes render client-side. Set `paths.base` to the repo name for project Pages.
- **Package manager:** npm.
- **Styling:** **Tailwind CSS v4** for layout/utilities + hand-written CSS for motion. **Icons:** `lucide-svelte`.
- **Animations:** Svelte native `transition:`/`animate:` + CSS; MUST respect `prefers-reduced-motion`.
- **Data fetch:** native `fetch` inside SvelteKit `load` functions + a small `src/lib/api/cache.ts` in-memory cache (Map keyed by URL). No data-fetching library.
- **Validation:** **zod** — a schema per PokeAPI shape you consume, in `src/lib/api/schemas.ts`; parse every response.
- **State:** Svelte 5 runes + a couple of stores; **favorites + theme** persisted to `localStorage`.
- **Testing:** **vitest** (unit) + **Playwright** (e2e).
- **Lint/format:** **ultracite** configured to use **oxlint** + **oxfmt** (consult context7 docs for exact wiring). Scripts: `lint`, `format`, `check` (svelte-check/tsc).
- **Git hooks:** **lefthook** — pre-commit: oxlint + oxfmt + typecheck on staged; pre-push: `npm run test`.
- **CI/CD:** GitHub Actions on push to `main`: install → lint → check → test → build → **deploy to GitHub Pages** (`actions/upload-pages-artifact` + `actions/deploy-pages`, `permissions: pages: write, id-token: write`). Enable Pages via `gh api` if needed.

## Pages & features — PINNED

1. **`/` Pokédex list**: responsive card grid (sprite via `<PokemonImage>`, name, dex number, type badges colored per type). **Infinite scroll** (IntersectionObserver, 30/page) with skeleton loaders. Card hover/tap micro-animation. Uses `/pokemon?limit&offset` + per-pokemon detail fetch (cached).
2. **Search + Filters** (on the list, in a sticky toolbar):
   - **Search** by name, debounced (250ms).
   - **Filter: Generation** 1–9 (via `/generation/{id}`).
   - **Filter: Type/Element** (18 types, via `/type/{name}`), multi-select.
   - **Sort:** by dex number (default) or by base-stat total.
   - A visible "clear filters" control; empty-state UI when no matches.
3. **`/pokemon/[name]` Detail**: large official artwork, animated entrance, type badges, height/weight, **animated base-stat bars**, abilities (with hidden-ability tag), a few example moves, **evolution chain** (via species→evolution-chain), **sprite variants** switcher (front/back/shiny), and a **play-cry** audio button. Back navigation.
4. **`/berries` + `/berries/[name]`**: berries list (`/berry`) and detail (firmness, flavors, growth time, size). Same card aesthetic.
5. **`/favorites`**: grid of favorited Pokémon (localStorage), add/remove via a heart button present on cards + detail; persists across reload.
6. **Global:** dark/light **theme toggle** (persisted), responsive nav/header, 404 page, loading + error states everywhere, accessible (labels, focus states, keyboard nav, alt text).

## Design / aesthetic

Invoke the **emil design skill** for guidance. Aim for a modern, tactile feel: type-colored gradients, soft shadows, smooth page/element transitions, animated stat bars, skeletons, good typography, dark mode, tasteful motion that respects `prefers-reduced-motion`. It should look genuinely nice, not a wireframe.

## Verify-as-you-go loop (do this for EACH feature)

1. Implement the feature.
2. Run the dev server (`npm run dev`, background) and use **playwright/chrome-devtools MCP** to navigate the running app, **take screenshots**, and perform user actions (search, filter, click into a detail, favorite, toggle theme) to confirm it actually works and looks right.
3. Spawn a **subagent to review** the just-written code + the screenshots (correctness, a11y, aesthetics); apply its feedback.
4. Fix issues, commit (lefthook runs). Move on.

## Anti-stuck rule (IMPORTANT)

Do not loop on the same error. If a step fails twice the same way: consult docs via **context7**, search the error, or try a different approach — then move on. Never spend many turns re-trying the identical failing command. Prefer progress on other features over perfecting one blocker.

## Docs

Use **context7** (`resolve-library-id` + `query-docs`) for SvelteKit, adapter-static, Tailwind v4, ultracite/oxlint/oxfmt, lefthook, zod, Playwright, and the GitHub Pages Actions flow — don't guess APIs.

## Repo / deploy

Git remote (SSH): `https://github.com/AZagatti/pokedex-s5hi-opusadv.git` (already created, empty). `git init`, set remote `origin`, commit in logical chunks, push to `main`. `paths.base` must be `/pokedex-s5hi-opusadv`. The live URL will be `https://azagatti.github.io/pokedex-s5hi-opusadv/`.
