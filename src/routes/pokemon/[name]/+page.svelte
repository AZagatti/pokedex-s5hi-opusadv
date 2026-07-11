<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import { resolve } from "$app/paths";
  import CryButton from "$lib/components/CryButton.svelte";
  import EvolutionChain from "$lib/components/EvolutionChain.svelte";
  import FavoriteButton from "$lib/components/FavoriteButton.svelte";
  import SpriteSwitcher from "$lib/components/SpriteSwitcher.svelte";
  import StatBar from "$lib/components/StatBar.svelte";
  import TypeBadge from "$lib/components/TypeBadge.svelte";
  import { formatName } from "$lib/utils/format";
  import { prefersReducedMotion } from "$lib/utils/motion";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const pokemon = $derived(data.pokemon);
  const species = $derived(data.species);

  const artwork = $derived(
    pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default
  );
  const heightMeters = $derived((pokemon.height / 10).toFixed(1));
  const weightKg = $derived((pokemon.weight / 10).toFixed(1));
  const sortedTypes = $derived([...pokemon.types].toSorted((a, b) => a.slot - b.slot));
  const sortedStats = $derived([...pokemon.stats]);
  const statTotal = $derived(sortedStats.reduce((sum, s) => sum + s.base_stat, 0));
  const exampleMoves = $derived(pokemon.moves.slice(0, 8));
  const hasEvolutions = $derived(data.evolutionChain.chain.evolves_to.length > 0);
  const cryUrl = $derived(pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null);
  const flavorText = $derived(
    species.flavor_text_entries
      .find((entry) => entry.language.name === "en")
      ?.flavor_text.replaceAll(/[\f\n\r]+/gu, " ")
  );

  const entranceParams = () => ({ duration: prefersReducedMotion() ? 0 : 500, y: 24 });
  const fadeParams = () => ({ duration: prefersReducedMotion() ? 0 : 300 });
</script>

<svelte:head>
  <title>{formatName(pokemon.name)} — Pokédex</title>
  <meta name="description" content={flavorText ?? `Stats, types, and evolutions for ${pokemon.name}.`} />
</svelte:head>

<a href={resolve("/")} class="back-link">
  <ArrowLeft size={18} aria-hidden="true" />
  Back to Pokédex
</a>

{#key pokemon.name}
<div class="detail" in:fade={fadeParams()}>
  <header class="detail__header">
    <div class="detail__artwork" in:fly={entranceParams()}>
      {#if artwork}
        <img src={artwork} alt={formatName(pokemon.name)} width="240" height="240" loading="eager" fetchpriority="high" />
      {/if}
    </div>

    <div class="detail__heading">
      <span class="detail__dex">#{String(pokemon.id).padStart(3, "0")}</span>
      <div class="detail__name-row">
        <h1>{formatName(pokemon.name)}</h1>
        <FavoriteButton name={pokemon.name} />
      </div>
      <div class="detail__types">
        {#each sortedTypes as t (t.type.name)}
          <TypeBadge type={t.type.name} />
        {/each}
      </div>
      {#if flavorText}
        <p class="detail__flavor">{flavorText}</p>
      {/if}
      <dl class="detail__measurements">
        <div>
          <dt>Height</dt>
          <dd>{heightMeters} m</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{weightKg} kg</dd>
        </div>
      </dl>
      {#if cryUrl}
        <CryButton src={cryUrl} name={pokemon.name} />
      {/if}
    </div>
  </header>

  <section class="detail__section">
    <h2>Base stats <span class="detail__stat-total">Total {statTotal}</span></h2>
    <div class="detail__stats">
      {#each sortedStats as stat (stat.stat.name)}
        <StatBar label={formatName(stat.stat.name)} value={stat.base_stat} />
      {/each}
    </div>
  </section>

  <section class="detail__section">
    <h2>Sprites</h2>
    <SpriteSwitcher sprites={pokemon.sprites} name={pokemon.name} />
  </section>

  <section class="detail__section">
    <h2>Abilities</h2>
    <ul class="detail__pill-list">
      {#each pokemon.abilities as ability (ability.ability.name)}
        <li class="detail__pill">
          {formatName(ability.ability.name)}
          {#if ability.is_hidden}
            <span class="detail__hidden-tag">Hidden</span>
          {/if}
        </li>
      {/each}
    </ul>
  </section>

  <section class="detail__section">
    <h2>Example moves</h2>
    <ul class="detail__pill-list">
      {#each exampleMoves as move (move.move.name)}
        <li class="detail__pill">{formatName(move.move.name)}</li>
      {/each}
    </ul>
  </section>

  {#if hasEvolutions}
    <section class="detail__section">
      <h2>Evolution chain</h2>
      <EvolutionChain link={data.evolutionChain.chain} currentName={pokemon.name} />
    </section>
  {/if}
</div>
{/key}

<style>
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .detail__header {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: flex-start;
    margin-bottom: 2.5rem;
  }

  .detail__artwork {
    flex-shrink: 0;
    width: 240px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-md);
  }

  .detail__artwork img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .detail__heading {
    flex: 1 1 20rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail__dex {
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .detail__name-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .detail__name-row h1 {
    font-size: 2rem;
    font-weight: 800;
    text-transform: capitalize;
  }

  .detail__types {
    display: flex;
    gap: 0.5rem;
  }

  .detail__flavor {
    color: var(--text-muted);
    max-width: 32rem;
  }

  .detail__measurements {
    display: flex;
    gap: 2rem;
    margin: 0.5rem 0;
  }

  .detail__measurements dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .detail__measurements dd {
    margin: 0;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .detail__section {
    margin-bottom: 2.5rem;
  }

  .detail__section h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .detail__stat-total {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .detail__stats {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 32rem;
  }

  .detail__pill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .detail__pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: var(--surface-hover);
    text-transform: capitalize;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .detail__hidden-tag {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
</style>
