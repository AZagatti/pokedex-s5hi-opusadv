<script lang="ts">
  import BerryCard from "$lib/components/BerryCard.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Berries — Pokédex</title>
  <meta name="description" content="Browse every berry — firmness, flavors, growth time, and size." />
</svelte:head>

<h1 class="page-title">Berries</h1>

<div class="berry-grid">
  {#each data.berries as berry (berry.name)}
    <BerryCard name={berry.name} />
  {/each}
</div>

<style>
  .page-title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
  }

  .berry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 1rem;
  }
</style>
