# Decisions

Rationale for the pinned tech choices and the handful of deviations made along the way. Newest/most consequential first.

## `/` is server-rendered at build time; every other route is pure CSR

**What:** The root `+layout.ts` sets `ssr = false` for the whole app. `src/routes/+page.ts` (the list page) overrides that with `ssr = true`, so its `load` runs against the live PokeAPI during `npm run build` and the first page of results is baked into the prerendered HTML.

**Why:** The original design was pure CSR everywhere — no route's content depends on the build environment having network access, which keeps the build simple and fast. Lighthouse punished this on `/` specifically: an empty CSR shell means nothing paints until JS boots, fetches the list, and fans out ~30 per-card detail requests, which measured as Performance 69 and a 13-second LCP on a throttled mobile profile. Grid image weight and eager-loading fixes alone only got to 76 (LCP 6s) — the empty-shell-then-fetch structure was the real ceiling. Overriding `ssr` for just this one route means the LCP element (the first card's image) exists in the HTML before any JS runs at all: Performance 99-100, LCP ~1.3s locally and Performance 100, LCP 1.6s on the live deployed URL.

**Cost:** `npm run build` now makes real network calls to PokeAPI (previously it never did). Mitigated with a try/catch around the whole `load` function: a PokeAPI blip at build time degrades to an empty seed, and the page falls back to its pre-existing client-side fetch-on-mount behavior — a slow build, not a broken one. The embedded page data is a trimmed per-card projection (id/sprite/types), not full `Pokemon` objects, to keep the HTML small (~80KB, not ~200KB+). The list page's mount effect also needs an explicit one-time skip so it doesn't immediately re-fetch and overwrite the server-rendered grid.

## Grid cards use the small default sprite, not the official artwork

**What:** `PokemonCard` renders `sprites.front_default` (a few KB) instead of `sprites.other['official-artwork'].front_default` (100-200KB). The detail page still uses official artwork — there's only one image to load there.

**Why:** With 30+ cards on screen, official artwork was the single biggest Lighthouse cost even after the SSR fix. The retro pixel-sprite look also reads as an intentional style choice on the gradient card background, not a downgrade.

## `BASE_PATH` env var, not `command === 'build'`, drives the base path

**What:** `vite.config.ts` reads `process.env.BASE_PATH` to set Kit's `paths.base`; only the CI deploy step sets it (`BASE_PATH=/pokedex-s5hi-opusadv`). Every local build — including the one `npm run test:e2e`/Lighthouse runs against — stays at base `''`.

**Why:** Tying `base` to `command === 'build'` would break every local production-build workflow: `vite preview` serves files from disk at `/`, so a build baked with the `/pokedex-s5hi-opusadv/` prefix would 404 on all its own assets under plain `vite preview`. GitHub Pages project-site hosting supplies that path prefix externally (via the URL, not the served files' own layout), so it only needs to be baked in for the one build that actually ships there. `scripts/pages-emulate.mjs` exists specifically to verify that one build's base-path behavior locally, since `vite preview` can't reproduce it.

## In-memory `Map<string, Promise>` cache, not a cache library

**What:** `src/lib/api/cache.ts` is ~20 lines: a module-level `Map` keyed by URL, storing in-flight/resolved fetch promises, evicting on failure.

**Why:** The spec asks for "a small `src/lib/api/cache.ts` in-memory Map cache" specifically — this is a client-side SPA with no server to share a cache across users/requests, so a heavier solution (SWR-style library, IndexedDB) would be solving a problem this app doesn't have. The one property worth calling out: caching the _promise_, not just the eventual value, is what dedupes concurrent requests for the same URL (e.g. two cards that both need Pikachu's detail at once), not just repeat ones.

## Recursive `EvolutionChain` via self-import, not `<svelte:self>`

**What:** `EvolutionChain.svelte` imports itself to recurse over the evolution tree.

**Why:** `<svelte:self>` is deprecated in this Svelte version (`svelte-check` flags it); Svelte's own docs point to a component importing itself instead. This trips `import/no-cycle` and `import/no-self-import` oxlint rules, so it's an explicit, commented `oxlint-disable-next-line`. An earlier version of this component flattened the evolution chain into depth-grouped arrays instead of recursing — that lost branch topology for any Pokémon with a branching chain (e.g. Wurmple's two possible evolutions), which a code review caught against real PokeAPI data before it shipped.

## WCAG-contrast-checked type badge text color

**What:** `getReadableTextColor()` computes relative luminance and picks black or white text per type color, instead of hardcoding white.

**Why:** A fixed white text color failed contrast checks against several light type colors (electric, ice, steel, fairy, ground, normal) — caught by an accessibility review pass, not by design intent.

## `{#key pokemon.name}` around the detail page's content

**What:** The whole detail-page body is wrapped in `{#key pokemon.name}`.

**Why:** SvelteKit reuses component instances across client-side navigations between different params of the same route (e.g. `/pokemon/charizard` → `/pokemon/charmander`). Without the `#key`, `onMount`-driven state (the stat-bar fill animation, the sprite switcher's active tab) went stale — navigating via an evolution-chain link showed the new Pokémon's name with the _previous_ Pokémon's stat-bar widths still rendered. `{#key}` forces the block to destroy and recreate on identity change, which also correctly replays the entrance transition for the new Pokémon.

## Playwright pinned to a specific port and host

**What:** `playwright.config.ts` uses a fixed port (not Vite's/Playwright's default) with `strictPort` + `reuseExistingServer: false`, and the preview server is bound explicitly to `--host 127.0.0.1` with Playwright's readiness check pointed at that same literal address.

**Why:** Two separate, environment-specific failure modes surfaced during development, not from the app itself:

- Locally, this host runs sibling sandboxes that already occupy common dev-server ports (4173 in particular); a default port risked silently attaching to an unrelated server instead of ours, since Playwright's `reuseExistingServer` (true outside `CI` env) would treat _anything_ answering on that port as "already up."
- In CI, every e2e test failed with `net::ERR_CONNECTION_REFUSED` even though the build/preview logs showed no errors. Playwright's default webServer readiness check polls `localhost`, while the test `baseURL` used the literal `127.0.0.1` — on that runner these resolved to different loopback interfaces, so the readiness check could pass against one while real test traffic hit the other (refused). Binding the preview server and the readiness check to the identical literal address removes the ambiguity.

## E2E tests fail on any unexpected console error

**What:** `e2e/fixtures.ts` exports a `test` that auto-attaches console/page-error listeners and fails the test if anything logged is not on a per-test allowlist.

**Why:** Without this, a hydration mismatch or a runtime `TypeError` that doesn't happen to break an assertion would pass silently. The one legitimate exception (the 404 test's own router "not found" log, plus the browser's own 404 resource-load log for the missing document) is allowlisted per-test via `test.use()`, not globally — a blanket "ignore 404s" would also hide a genuinely broken image source elsewhere.
