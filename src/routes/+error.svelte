<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
</script>

<svelte:head>
  <title>{page.status} — Pokédex</title>
</svelte:head>

<div class="error-page">
  <span class="error-page__ball" aria-hidden="true"></span>
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? "This page fainted and could not be found."}</p>
  <a href={resolve("/")} class="error-page__link">Back to the Pokédex</a>
</div>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    padding: 4rem 1rem;
  }

  .error-page__ball {
    width: 4rem;
    height: 4rem;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--accent) 0 50%, #fff 50% 100%);
    box-shadow: 0 0 0 3px var(--text) inset;
  }

  .error-page h1 {
    font-size: 3rem;
    font-weight: 800;
  }

  .error-page p {
    color: var(--text-muted);
    max-width: 28rem;
  }

  .error-page__link {
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 600;
    box-shadow: var(--shadow-sm);
    transition: transform 150ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .error-page__link:hover {
      transform: translateY(-1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .error-page__link {
      transition: none;
    }
  }
</style>
