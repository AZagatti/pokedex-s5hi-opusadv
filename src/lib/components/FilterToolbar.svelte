<script lang="ts">
  import { Search, X } from "lucide-svelte";
  import { GENERATIONS, POKEMON_TYPES } from "$lib/api/client";
  import { getReadableTextColor, getTypeColor } from "$lib/constants/type-colors";

  interface Props {
    search: string;
    generationId: number | null;
    types: Set<string>;
    sortBy: "dex" | "stats";
    resultCount: number | null;
  }

  let {
    search = $bindable(),
    generationId = $bindable(),
    types = $bindable(),
    sortBy = $bindable(),
    // oxlint-disable-next-line prefer-const
    resultCount,
  }: Props = $props();

  const hasActiveFilters = $derived(
    search.trim().length > 0 || generationId !== null || types.size > 0 || sortBy !== "dex"
  );

  const toggleType = (type: string) => {
    const next = new Set(types);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    types = next;
  };

  const clearFilters = () => {
    search = "";
    generationId = null;
    types = new Set();
    sortBy = "dex";
  };
</script>

<div class="toolbar">
  <div class="toolbar__row">
    <label class="toolbar__search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        name="pokemon-search"
        placeholder="Search Pokémon by name…"
        bind:value={search}
        aria-label="Search Pokémon by name"
      />
    </label>

    <label class="toolbar__field">
      <span>Generation</span>
      <select name="generation" bind:value={generationId}>
        <option value={null}>All</option>
        {#each GENERATIONS as gen (gen.id)}
          <option value={gen.id}>Gen {gen.id}</option>
        {/each}
      </select>
    </label>

    <label class="toolbar__field">
      <span>Sort by</span>
      <select name="sort-by" bind:value={sortBy}>
        <option value="dex">Dex number</option>
        <option value="stats">Base stat total</option>
      </select>
    </label>

    {#if hasActiveFilters}
      <button type="button" class="toolbar__clear" onclick={clearFilters}>
        <X size={16} aria-hidden="true" />
        Clear filters
      </button>
    {/if}
  </div>

  <fieldset class="toolbar__types">
    <legend>Type</legend>
    <div class="toolbar__type-chips">
      {#each POKEMON_TYPES as type (type)}
        {@const active = types.has(type)}
        {@const chipColor = getTypeColor(type)}
        <button
          type="button"
          class="type-chip"
          class:type-chip--active={active}
          style:--chip-color={chipColor}
          style:--chip-text-color={getReadableTextColor(chipColor)}
          aria-pressed={active}
          onclick={() => toggleType(type)}
        >
          {type}
        </button>
      {/each}
    </div>
  </fieldset>

  {#if resultCount !== null}
    <p class="toolbar__count" aria-live="polite">
      {resultCount}
      {resultCount === 1 ? "Pokémon" : "Pokémon"} found
    </p>
  {/if}
</div>

<style>
  .toolbar {
    position: sticky;
    top: 4rem;
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 1rem;
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-sm);
  }

  .toolbar__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  .toolbar__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1 1 14rem;
    padding: 0.6rem 0.9rem;
    border-radius: 0.75rem;
    background: var(--surface-hover);
    color: var(--text-muted);
    box-shadow: 0 0 0 2px transparent;
    transition: box-shadow 150ms var(--ease-out);
  }

  .toolbar__search:has(input:focus-visible) {
    box-shadow: 0 0 0 2px var(--accent);
  }

  .toolbar__search input {
    border: none;
    background: transparent;
    outline: none;
    color: var(--text);
    font-size: 16px;
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .toolbar__search {
      transition: none;
    }
  }

  .toolbar__field {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .toolbar__field select {
    padding: 0.5rem 0.6rem;
    border-radius: 0.6rem;
    background: var(--surface-hover);
    color: var(--text);
    font-size: 16px;
  }

  .toolbar__clear {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem 0.85rem;
    border-radius: 0.6rem;
    background: var(--surface-hover);
    color: var(--text);
    font-weight: 500;
    font-size: 0.85rem;
    transition: background-color 150ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .toolbar__clear:hover {
      background: var(--border);
    }
  }

  .toolbar__types {
    border: none;
    padding: 0;
    margin: 0;
  }

  .toolbar__types legend {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
    padding: 0;
  }

  .toolbar__type-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .type-chip {
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
    color: var(--text-muted);
    box-shadow: inset 0 0 0 1.5px var(--border);
    transition:
      color 150ms var(--ease-out),
      box-shadow 150ms var(--ease-out),
      background-color 150ms var(--ease-out);
  }

  .type-chip--active {
    color: var(--chip-text-color);
    background: var(--chip-color);
    box-shadow: none;
  }

  .toolbar__count {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .toolbar__clear,
    .type-chip {
      transition: none;
    }
  }
</style>
