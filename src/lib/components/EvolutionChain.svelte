<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
  import { resolve } from "$app/paths";
  import { idFromUrl } from "$lib/api/client";
  import type { EvolutionChainLink } from "$lib/api/schemas";
  import { formatName } from "$lib/utils/format";
  // Recursive tree rendering — Svelte's documented replacement for the
  // deprecated <svelte:self>, so a self-import is intentional here.
  // oxlint-disable-next-line no-cycle, no-self-import
  import EvolutionChain from "./EvolutionChain.svelte";

  interface Props {
    link: EvolutionChainLink;
    currentName: string;
  }

  const { link, currentName }: Props = $props();
  const minLevel = $derived(link.evolution_details[0]?.min_level ?? null);

  const spriteUrl = (url: string) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idFromUrl(url)}.png`;
</script>

<ul class="evolution-chain">
  <li class="evolution-chain__node">
    <a
      href={resolve(`/pokemon/${link.species.name}`)}
      class="evolution-chain__item"
      class:evolution-chain__item--current={link.species.name === currentName}
    >
      <img src={spriteUrl(link.species.url)} alt="" width="48" height="48" loading="lazy" />
      <span>{formatName(link.species.name)}</span>
      {#if minLevel}
        <small>Lv. {minLevel}</small>
      {/if}
    </a>

    {#if link.evolves_to.length > 0}
      <div class="evolution-chain__branches">
        {#each link.evolves_to as child (child.species.name)}
          <div class="evolution-chain__branch">
            <ChevronRight size={20} class="evolution-chain__arrow" aria-hidden="true" />
            <EvolutionChain link={child} {currentName} />
          </div>
        {/each}
      </div>
    {/if}
  </li>
</ul>

<style>
  .evolution-chain {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .evolution-chain__node {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .evolution-chain__branches {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .evolution-chain__branch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .evolution-chain :global(.evolution-chain__arrow) {
    flex-shrink: 0;
    color: var(--text-muted);
  }

  .evolution-chain__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.6rem 1rem;
    border-radius: 0.75rem;
    background: var(--surface-hover);
    font-weight: 500;
    text-transform: capitalize;
    transition: background-color 150ms var(--ease-out);
  }

  .evolution-chain__item--current {
    background: var(--accent);
    color: var(--accent-contrast);
  }

  .evolution-chain__item small {
    font-weight: 400;
    opacity: 0.75;
  }

  @media (hover: hover) and (pointer: fine) {
    .evolution-chain__item:hover {
      background: var(--border);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .evolution-chain__item {
      transition: none;
    }
  }
</style>
