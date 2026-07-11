<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import { resolve } from "$app/paths";
  import { berrySpriteUrl } from "$lib/api/client";
  import StatBar from "$lib/components/StatBar.svelte";
  import { formatName } from "$lib/utils/format";
  import type { PageProps } from "./$types";

  const FLAVOR_POTENCY_MAX = 40;

  const { data }: PageProps = $props();
  const berry = $derived(data.berry);
  const sizeCm = $derived((berry.size / 10).toFixed(1));
  const activeFlavors = $derived(berry.flavors.filter((f) => f.potency > 0));
</script>

<svelte:head>
  <title>{formatName(berry.name)} — Pokédex</title>
  <meta name="description" content={`Firmness, flavors, growth time, and size for ${berry.name} berry.`} />
</svelte:head>

<a href={resolve("/berries")} class="back-link">
  <ArrowLeft size={18} aria-hidden="true" />
  Back to Berries
</a>

<header class="berry-header">
  <div class="berry-header__image">
    <img src={berrySpriteUrl(berry.item.name)} alt="" width="96" height="96" loading="eager" />
  </div>
  <div>
    <h1>{formatName(berry.name)}</h1>
    <p class="berry-header__firmness">{formatName(berry.firmness.name)} firmness</p>
  </div>
</header>

<dl class="berry-stats">
  <div>
    <dt>Growth time</dt>
    <dd>{berry.growth_time} {berry.growth_time === 1 ? "hour" : "hours"} / stage</dd>
  </div>
  <div>
    <dt>Size</dt>
    <dd>{sizeCm} cm</dd>
  </div>
  <div>
    <dt>Max harvest</dt>
    <dd>{berry.max_harvest}</dd>
  </div>
  <div>
    <dt>Smoothness</dt>
    <dd>{berry.smoothness}</dd>
  </div>
  <div>
    <dt>Natural gift power</dt>
    <dd>{berry.natural_gift_power}</dd>
  </div>
  <div>
    <dt>Soil dryness</dt>
    <dd>{berry.soil_dryness}</dd>
  </div>
</dl>

{#if activeFlavors.length > 0}
  <section class="berry-flavors">
    <h2>Flavors</h2>
    <div class="berry-flavors__bars">
      {#each activeFlavors as flavor (flavor.flavor.name)}
        <StatBar label={formatName(flavor.flavor.name)} value={flavor.potency} max={FLAVOR_POTENCY_MAX} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .berry-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .berry-header__image {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface);
    border-radius: 1.25rem;
    box-shadow: var(--shadow-md);
  }

  .berry-header h1 {
    font-size: 2rem;
    font-weight: 800;
    text-transform: capitalize;
  }

  .berry-header__firmness {
    color: var(--text-muted);
    text-transform: capitalize;
  }

  .berry-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
    gap: 1rem;
    margin: 0 0 2.5rem;
  }

  .berry-stats dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .berry-stats dd {
    margin: 0;
    font-weight: 700;
    font-size: 1.15rem;
  }

  .berry-flavors h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .berry-flavors__bars {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 32rem;
  }
</style>
