<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/Header.svelte";

  const { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<a href="#main" class="skip-link">Skip to content</a>
<Header />
<main id="main" class="app-main">
  {@render children()}
</main>

<style>
  .app-main {
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 4rem;
    min-height: calc(100vh - 4rem);
  }
</style>
