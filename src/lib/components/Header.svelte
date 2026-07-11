<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import ThemeToggle from "./ThemeToggle.svelte";

  const links = [
    { href: resolve("/"), label: "Pokédex" },
    { href: resolve("/berries"), label: "Berries" },
    { href: resolve("/favorites"), label: "Favorites" },
  ];
</script>

<header class="header">
  <div class="header__inner">
    <a href={resolve("/")} class="header__brand">
      <span class="header__ball" aria-hidden="true"></span>
      Pokédex
    </a>

    <nav class="header__nav" aria-label="Main">
      {#each links as link (link.href)}
        <a href={link.href} class="header__link" aria-current={page.url.pathname === link.href ? "page" : undefined}>
          {link.label}
        </a>
      {/each}
    </nav>

    <ThemeToggle />
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--surface) 92%, transparent);
    backdrop-filter: blur(8px);
    box-shadow: 0 1px 0 var(--border);
  }

  .header__inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1.25rem;
  }

  .header__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text);
    white-space: nowrap;
  }

  .header__ball {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--accent) 0 50%, #fff 50% 100%);
    box-shadow: 0 0 0 2px var(--text) inset;
  }

  .header__nav {
    display: flex;
    gap: 0.25rem;
    flex: 1;
    overflow-x: auto;
  }

  .header__link {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    color: var(--text-muted);
    font-weight: 500;
    white-space: nowrap;
    transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out);
  }

  .header__link[aria-current="page"] {
    color: var(--text);
    background: var(--surface-hover);
  }

  @media (hover: hover) and (pointer: fine) {
    .header__link:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header__link {
      transition: none;
    }
  }
</style>
