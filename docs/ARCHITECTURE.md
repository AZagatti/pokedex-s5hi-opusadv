# Architecture

## Route structure

```
src/routes/
├── +layout.svelte / +layout.ts   # global shell (Header, skip-link); prerender=true, ssr=false
├── +error.svelte                  # 404 / error page
├── +page.svelte / +page.ts        # "/" — Pokédex list (see "The one SSR'd route" below)
├── pokemon/[name]/+page.svelte    # detail page; +page.ts sets prerender=false
├── berries/+page.svelte           # berries list
├── berries/[name]/+page.svelte    # berry detail; +page.ts sets prerender=false
└── favorites/+page.svelte         # favorites (reads localStorage via a store, no +page.ts)
```

Every route renders through `@sveltejs/adapter-static` in SPA mode: `fallback: '404.html'` means any URL adapter-static didn't pre-generate a file for (i.e. any `/pokemon/:name` or `/berries/:name`) is served the same fallback shell, which then client-side-routes to the right page. This is what makes a hard reload on `/pokemon/charizard` work on GitHub Pages without a real server.

## Data flow

All Pokémon/berry data comes from [PokeAPI](https://pokeapi.co/) via `src/lib/api/client.ts` — a thin set of functions (`getPokemon`, `getPokemonList`, `getBerry`, ...) that each call `cachedFetch(url, zodSchema)` from `src/lib/api/cache.ts`.

`cachedFetch` is a `Map<string, Promise<unknown>>` keyed by URL:

- A second call for the same URL while the first is still in flight returns the _same promise_ (dedupes concurrent requests — e.g. the list page's per-card detail fetches never issue a duplicate request for a Pokémon two cards ask for at once).
- On success, the promise (and its resolved value) stays cached for the session.
- On failure, the entry is evicted, so a later retry actually re-fetches instead of replaying the same rejection forever.
- Every response is parsed through a [Zod](https://zod.dev/) schema (`src/lib/api/schemas.ts`) before use, so a shape PokeAPI never actually sends fails loudly at the fetch boundary instead of silently as `undefined` three components later.

`src/lib/pokemon/candidates.ts` builds the filterable candidate pool for the list page: given a search string / generation / set of types, it fetches (and caches) the relevant type/generation indexes, intersects them, and returns a plain name+URL list for the list page to paginate through client-side. It returns `null` when no filter is active, telling the caller to fall back to the cheaper server-paginated `/pokemon` browse endpoint instead of downloading the full ~1300-entry index.

## Rendering strategy: CSR-only, with one SSR'd route

The root `+layout.ts` sets:

```ts
export const prerender = true;
export const ssr = false;
```

Every route gets a prerendered static HTML shell (so adapter-static has something to write to disk and serve as the SPA fallback), but `ssr = false` means none of that shell's _content_ is server-rendered — the actual UI only exists after Svelte hydrates in the browser and runs each route's own `fetch` calls. This decouples the build entirely from PokeAPI's availability/latency for every route except one (below), and matches "prerender static routes, dynamic detail routes client-side" from the project spec.

**The one exception is `/` itself.** `src/routes/+page.ts` overrides `ssr = true` for just this route, so its `load` function runs during the build's prerender step (against the _live_ PokeAPI) and the first page of Pokémon — including the image that becomes the page's Largest Contentful Paint element — is baked directly into the prerendered HTML. Every other route stays pure CSR. See [`DECISIONS.md`](DECISIONS.md) for why this one route needed the exception and what it cost.

The `+page.svelte` for `/` seeds its `$state` entries from that prerendered data on mount (skipping the first run of its own filter-effect so it doesn't immediately re-fetch and wipe what the server already rendered), then behaves exactly like a normal CSR page for every subsequent search, filter, sort, or infinite-scroll interaction.

## State & persistence

- **Favorites** (`src/lib/stores/favorites.svelte.ts`) and **theme** (`src/lib/stores/theme.svelte.ts`) are singleton classes using Svelte 5 runes (`$state`), instantiated once at module scope and imported wherever needed. Both guard every `localStorage`/`document` access behind `$app/environment`'s `browser` check, since the module is also evaluated (harmlessly) during the one SSR'd `/` build.
- Theme has a second guard against flash-of-wrong-theme: a blocking inline `<script>` in `src/app.html` reads `localStorage`/`prefers-color-scheme` and sets `documentElement.dataset.theme` before any Svelte code runs, so the store's own initial read (during hydration) just picks up what's already there.
- List-page filter/sort/search state and infinite-scroll state are local component `$state`, not global stores — there's no requirement to share or persist it across navigations.

## Key components

- `PokemonCard` / `PokemonImage` — the list grid's card. Deliberately renders the _small default sprite_, not the official artwork, for load-time reasons (see DECISIONS.md). Uses a "stretched link" pattern (an absolutely-positioned `<a>` behind the card content, with the favorite `<button>` as a separately-stacked sibling) so the whole card is clickable without nesting an interactive button inside an anchor.
- `EvolutionChain` — recurses over the raw PokeAPI evolution-chain tree via a self-import (Svelte's documented replacement for the deprecated `<svelte:self>`), so branching chains (e.g. Wurmple, Eevee) render with correct topology instead of a flattened guess.
- `SpriteSwitcher` — a full ARIA tabs pattern (`role="tablist"`/`"tab"`/`"tabpanel"`, roving `tabindex`, arrow-key navigation) over the front/back/shiny sprite variants.
- `FilterToolbar` — owns search/generation/type/sort state via `$bindable` props; the list page combines it with `candidates.ts` to decide whether to browse (paginated, unfiltered) or use the computed candidate pool (filtered).

## Testing

- **Unit** (`src/**/*.test.ts`, Vitest): the API cache/client, the candidate-filtering logic, the concurrency helper, and the type-color/contrast helper — the parts with real branching logic worth pinning down in isolation.
- **E2E** (`e2e/*.e2e.ts`, Playwright): one spec per user-facing feature (list, detail, favorites, berries, theme, 404), run against a real production build+preview with real network calls to PokeAPI. A shared fixture (`e2e/fixtures.ts`) fails any test that logs an unexpected console error, so a future hydration or runtime regression shows up as a red test rather than a silent pass.
