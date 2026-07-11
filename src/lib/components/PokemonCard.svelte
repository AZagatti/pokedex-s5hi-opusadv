<script lang="ts">
  import { resolve } from "$app/paths";
  import { idFromUrl } from "$lib/api/client";
  import type { Pokemon } from "$lib/api/schemas";
  import { formatName } from "$lib/utils/format";
  import FavoriteButton from "./FavoriteButton.svelte";
  import PokemonImage from "./PokemonImage.svelte";
  import TypeBadge from "./TypeBadge.svelte";

  interface Props {
    name: string;
    url?: string;
    detail: Pokemon | null;
  }

  const { name, url = "", detail }: Props = $props();
  const dexNumber = $derived(detail?.id ?? idFromUrl(url));
  const sprite = $derived(
    detail?.sprites.other?.["official-artwork"]?.front_default ?? detail?.sprites.front_default
  );
</script>

<div class="pokemon-card">
  <a
    href={resolve(`/pokemon/${name}`)}
    class="pokemon-card__link"
    aria-label={`View ${formatName(name)}, #${String(dexNumber).padStart(3, "0")}`}
  ></a>
  <div class="pokemon-card__favorite">
    <FavoriteButton {name} />
  </div>
  <span class="pokemon-card__dex">#{String(dexNumber).padStart(3, "0")}</span>
  <div class="pokemon-card__image">
    {#if detail}
      <PokemonImage src={sprite} alt={name} size={112} />
    {:else}
      <div class="pokemon-card__skeleton-image" aria-hidden="true"></div>
    {/if}
  </div>
  <p class="pokemon-card__name">{name}</p>
  <div class="pokemon-card__types">
    {#if detail}
      {#each detail.types as t (t.type.name)}
        <TypeBadge type={t.type.name} size="sm" />
      {/each}
    {:else}
      <span class="pokemon-card__skeleton-badge" aria-hidden="true"></span>
      <span class="pokemon-card__skeleton-badge" aria-hidden="true"></span>
    {/if}
  </div>
</div>

<style>
  .pokemon-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1.25rem 1rem 1rem;
    border-radius: 1rem;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    isolation: isolate;
    transition:
      transform 200ms var(--ease-out),
      box-shadow 200ms var(--ease-out);
  }

  .pokemon-card:has(.pokemon-card__link:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .pokemon-card:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .pokemon-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pokemon-card {
      transition: none;
    }
    .pokemon-card:hover {
      transform: none;
    }
  }

  .pokemon-card__link {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    outline: none;
  }

  .pokemon-card__favorite {
    position: relative;
    z-index: 1;
    align-self: flex-end;
    margin: -0.75rem -0.5rem -0.25rem 0;
  }

  .pokemon-card__dex {
    align-self: flex-start;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .pokemon-card__image {
    width: 112px;
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pokemon-card__name {
    font-weight: 600;
    text-transform: capitalize;
    color: var(--text);
  }

  .pokemon-card__types {
    display: flex;
    gap: 0.35rem;
    min-height: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pokemon-card__skeleton-image,
  .pokemon-card__skeleton-badge {
    background: linear-gradient(
      90deg,
      var(--surface-hover) 25%,
      var(--border) 37%,
      var(--surface-hover) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 999px;
  }

  .pokemon-card__skeleton-image {
    width: 96px;
    height: 96px;
    border-radius: 0.75rem;
  }

  .pokemon-card__skeleton-badge {
    width: 3.5rem;
    height: 1.25rem;
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pokemon-card__skeleton-image,
    .pokemon-card__skeleton-badge {
      animation: none;
    }
  }
</style>
