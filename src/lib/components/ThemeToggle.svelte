<script lang="ts">
  import { Moon, Sun } from "lucide-svelte";
  import { themeStore } from "$lib/stores/theme.svelte";
</script>

<button
  type="button"
  class="theme-toggle"
  aria-label={themeStore.current === "dark" ? "Switch to light theme" : "Switch to dark theme"}
  onclick={() => themeStore.toggle()}
>
  {#if themeStore.current === "dark"}
    <Sun size={20} aria-hidden="true" />
  {:else}
    <Moon size={20} aria-hidden="true" />
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    background: var(--surface-hover);
    color: var(--text);
    transition: transform 150ms var(--ease-out);
    touch-action: manipulation;
  }

  .theme-toggle:active {
    transform: scale(0.92);
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-toggle {
      transition: none;
    }
  }
</style>
