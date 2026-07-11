<script lang="ts">
  import { untrack } from "svelte";
  import { resolve } from "$app/paths";
  import { getPokemon } from "$lib/api/client";
  import type { Pokemon } from "$lib/api/schemas";
  import PokemonCard from "$lib/components/PokemonCard.svelte";
  import PokemonCardSkeleton from "$lib/components/PokemonCardSkeleton.svelte";
  import { favoritesStore } from "$lib/stores/favorites.svelte";

  interface FavoriteEntry {
    name: string;
    detail: Pokemon | null;
  }

  let entries = $state<FavoriteEntry[]>([]);

  $effect(() => {
    const names = [...favoritesStore.names];
    // Read the current entries untracked, and use the local `nextEntries`
    // (not the `entries` state) for the rest of this run: this effect must
    // only re-run when favoritesStore.names changes, never when it reassigns
    // `entries` itself — re-reading the state after writing it would
    // re-establish that dependency and cause an infinite update loop.
    const existingByName = new Map(untrack(() => entries).map((entry) => [entry.name, entry]));
    entries = names.map((name) => existingByName.get(name) ?? { detail: null, name });

    // Read back through the `entries` proxy (still untracked) rather than
    // using the plain array we just assigned: mutating a plain, unproxied
    // object's property later would never notify Svelte's reactivity system.
    const missing = untrack(() => entries).filter((entry) => entry.detail === null);
    if (missing.length === 0) {
      return;
    }

    const loadMissing = async () => {
      await Promise.all(
        missing.map(async (entry) => {
          entry.detail = await getPokemon(entry.name);
        })
      );
    };
    void loadMissing();
  });
</script>

<svelte:head>
  <title>Favorites — Pokédex</title>
  <meta name="description" content="Your favorited Pokémon, saved on this device." />
</svelte:head>

<h1 class="page-title">Favorites</h1>

{#if entries.length === 0}
  <div class="empty-state">
    <p>You haven't favorited any Pokémon yet.</p>
    <a href={resolve("/")} class="empty-state__link">Browse the Pokédex</a>
  </div>
{:else}
  <div class="pokemon-grid">
    {#each entries as entry (entry.name)}
      {#if entry.detail}
        <PokemonCard name={entry.name} detail={entry.detail} />
      {:else}
        <PokemonCardSkeleton />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .page-title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
  }

  .pokemon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
    gap: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 4rem 1rem;
    color: var(--text-muted);
  }

  .empty-state__link {
    padding: 0.65rem 1.4rem;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 600;
  }
</style>
