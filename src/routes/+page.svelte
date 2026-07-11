<script lang="ts">
  import { untrack } from "svelte";
  import { getPokemon, getPokemonList } from "$lib/api/client";
  import { inViewport } from "$lib/actions/in-viewport";
  import type { Pokemon } from "$lib/api/schemas";
  import FilterToolbar from "$lib/components/FilterToolbar.svelte";
  import PokemonCard from "$lib/components/PokemonCard.svelte";
  import PokemonCardSkeleton from "$lib/components/PokemonCardSkeleton.svelte";
  import type { CardDetail } from "$lib/pokemon/card-detail";
  import { getCandidates, sortByDex } from "$lib/pokemon/candidates";
  import { mapWithConcurrency } from "$lib/utils/concurrency";
  import type { PageProps } from "./$types";

  const PAGE_SIZE = 30;
  const DEBOUNCE_MS = 250;

  interface Entry {
    name: string;
    url: string;
    detail: CardDetail | null;
  }

  const { data }: PageProps = $props();
  // `data` never changes after mount (this route has no params and never
  // calls goto()/invalidate()), so these are deliberately one-time reads to
  // seed initial state, not a value we want tracked reactively.
  const initialEntries = untrack(() => data.initialEntries);
  const initialHasMore = untrack(() => data.initialHasMore);
  const hasSeedData = initialEntries.length > 0;

  // Reassigned via `bind:` in the markup below, invisible to static analysis.
  // oxlint-disable-next-line prefer-const
  let searchInput = $state("");
  let debouncedSearch = $state("");
  // oxlint-disable-next-line prefer-const
  let generationId = $state<number | null>(null);
  // oxlint-disable-next-line prefer-const
  let types = $state<Set<string>>(new Set());
  // oxlint-disable-next-line prefer-const
  let sortBy = $state<"dex" | "stats">("dex");

  let entries = $state<Entry[]>(hasSeedData ? initialEntries : []);
  let hasMore = $state(hasSeedData ? initialHasMore : true);
  let isInitialLoading = $state(!hasSeedData);
  let isLoadingMore = $state(false);
  let isComputingStats = $state(false);
  let statsProgress = $state({ done: 0, total: 0 });
  let loadError = $state(false);

  // Unfiltered "browse" mode state (server-paginated).
  let browseOffset = hasSeedData ? PAGE_SIZE : 0;
  // Filtered/sorted candidate pool, sliced client-side.
  let candidatePool = $state<{ name: string; url: string; detail: CardDetail | null }[] | null>(null);

  let requestSeq = 0;
  // The mount effect below would otherwise immediately re-fetch page one and
  // wipe the SSR-seeded grid (flash-to-skeleton + wasted requests). Skip its
  // very first run when data was already seeded; every subsequent run is a
  // genuine filter change and should run applyFilters() as normal.
  let skipInitialApplyFilters = hasSeedData;

  $effect(() => {
    const value = searchInput;
    const timer = setTimeout(() => {
      debouncedSearch = value;
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  });

  const statTotal = (detail: Pokemon | null): number => {
    if (!detail) {
      return 0;
    }
    return detail.stats.reduce((sum, s) => sum + s.base_stat, 0);
  };

  const fetchDetails = (items: { name: string }[]): Promise<Pokemon[]> =>
    mapWithConcurrency(items, 12, (item) => getPokemon(item.name));

  const loadBrowsePage = async (seq: number) => {
    const list = await getPokemonList(PAGE_SIZE, browseOffset);
    if (seq !== requestSeq) {
      return;
    }
    browseOffset += PAGE_SIZE;
    hasMore = list.next !== null;

    const startIndex = entries.length;
    entries = [
      ...entries,
      ...list.results.map((r) => ({ detail: null, name: r.name, url: r.url })),
    ];

    const details = await fetchDetails(list.results);
    if (seq !== requestSeq) {
      return;
    }
    for (const [i, detail] of details.entries()) {
      const entry = entries[startIndex + i];
      if (entry) {
        entry.detail = detail;
      }
    }
  };

  const loadCandidatePage = async (seq: number) => {
    const pool = candidatePool;
    if (!pool) {
      return;
    }
    const nextSlice = pool.slice(entries.length, entries.length + PAGE_SIZE);
    const startIndex = entries.length;
    entries = [
      ...entries,
      ...nextSlice.map((c) => ({ detail: c.detail, name: c.name, url: c.url })),
    ];
    hasMore = entries.length < pool.length;

    const missing = nextSlice.map((c, i) => ({ c, i })).filter(({ c }) => c.detail === null);
    if (missing.length === 0) {
      return;
    }
    const details = await fetchDetails(missing.map(({ c }) => c));
    if (seq !== requestSeq) {
      return;
    }
    for (const [i, detail] of details.entries()) {
      const targetIndex = startIndex + (missing[i]?.i ?? 0);
      const entry = entries[targetIndex];
      if (entry) {
        entry.detail = detail;
      }
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || isInitialLoading || isComputingStats) {
      return;
    }
    isLoadingMore = true;
    const seq = requestSeq;
    try {
      await (candidatePool ? loadCandidatePage(seq) : loadBrowsePage(seq));
    } catch {
      if (seq === requestSeq) {
        loadError = true;
      }
    } finally {
      // Always clear the flag, even for a stale request, so a filter change
      // that supersedes an in-flight loadMore() can never leave pagination stuck.
      isLoadingMore = false;
    }
  };

  const applyFilters = async () => {
    requestSeq += 1;
    const seq = requestSeq;

    isInitialLoading = true;
    loadError = false;
    entries = [];
    candidatePool = null;
    browseOffset = 0;
    hasMore = true;
    isComputingStats = false;

    try {
      const filters = { generationId, search: debouncedSearch, types: [...types] };

      if (sortBy === "stats") {
        isComputingStats = true;
        const pool = sortByDex((await getCandidates(filters, { includeAllWhenEmpty: true })) ?? []);
        if (seq !== requestSeq) {
          return;
        }
        statsProgress = { done: 0, total: pool.length };
        const details = await mapWithConcurrency(pool, 24, async (item) => {
          const detail = await getPokemon(item.name);
          if (seq === requestSeq) {
            statsProgress = { done: statsProgress.done + 1, total: pool.length };
          }
          return detail;
        });
        if (seq !== requestSeq) {
          return;
        }
        const withDetail = pool.map((item, i) => ({ ...item, detail: details[i] ?? null }));
        candidatePool = withDetail.toSorted((a, b) => statTotal(b.detail) - statTotal(a.detail));
        isComputingStats = false;
        isInitialLoading = false;
        await loadCandidatePage(seq);
        return;
      }

      const filtered = await getCandidates(filters);
      if (seq !== requestSeq) {
        return;
      }
      candidatePool = filtered ? sortByDex(filtered).map((f) => ({ ...f, detail: null })) : null;
      isInitialLoading = false;
      await loadMore();
    } catch {
      if (seq === requestSeq) {
        loadError = true;
        isInitialLoading = false;
        isComputingStats = false;
      }
    }
  };

  $effect(() => {
    // Track reactive dependencies explicitly.
    void debouncedSearch;
    void generationId;
    void types;
    void sortBy;
    if (skipInitialApplyFilters) {
      skipInitialApplyFilters = false;
      return;
    }
    void applyFilters();
  });
</script>

<svelte:head>
  <title>Pokédex</title>
  <meta
    name="description"
    content="Browse, search, and filter every Pokémon with animated detail pages, evolution chains, and favorites."
  />
  <!-- Kicks off the very first (default, unfiltered) list fetch as soon as the
       HTML is parsed, instead of waiting for JS to boot and hydrate. -->
  <link rel="preload" as="fetch" crossorigin="anonymous" href="https://pokeapi.co/api/v2/pokemon?limit=30&offset=0" />
</svelte:head>

<h1 class="visually-hidden">Pokédex</h1>

<FilterToolbar
  bind:search={searchInput}
  bind:generationId
  bind:types
  bind:sortBy
  resultCount={candidatePool ? candidatePool.length : null}
/>

{#if isComputingStats}
  <p class="status-message" aria-live="polite">
    Computing base-stat totals… {statsProgress.done}/{statsProgress.total}
  </p>
{/if}

{#if loadError}
  <p class="status-message status-message--error" role="alert">
    Something went wrong loading Pokémon. Try adjusting your filters or reloading.
  </p>
{/if}

{#if isInitialLoading}
  <div class="pokemon-grid">
    {#each { length: 12 } as _, i (i)}
      <PokemonCardSkeleton />
    {/each}
  </div>
{:else if entries.length === 0}
  <div class="empty-state">
    <p>No Pokémon match your filters.</p>
  </div>
{:else}
  <div class="pokemon-grid">
    {#each entries as entry, i (entry.name)}
      <PokemonCard name={entry.name} url={entry.url} detail={entry.detail} eager={i < 12} />
    {/each}
  </div>

  {#if hasMore}
    <div use:inViewport={loadMore} class="sentinel" aria-hidden="true"></div>
    {#if isLoadingMore}
      <div class="pokemon-grid pokemon-grid--append">
        {#each { length: 6 } as _, i (i)}
          <PokemonCardSkeleton />
        {/each}
      </div>
    {/if}
  {/if}
{/if}

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .pokemon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
    gap: 1rem;
  }

  .pokemon-grid--append {
    margin-top: 1rem;
  }

  .sentinel {
    height: 1px;
  }

  .status-message {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: var(--surface-hover);
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .status-message--error {
    background: color-mix(in srgb, var(--danger) 15%, var(--surface));
    color: var(--danger);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    color: var(--text-muted);
  }
</style>
