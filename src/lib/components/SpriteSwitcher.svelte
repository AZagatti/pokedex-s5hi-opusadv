<script lang="ts">
  import type { PokemonSprites } from "$lib/api/schemas";
  import PokemonImage from "./PokemonImage.svelte";

  interface Props {
    sprites: PokemonSprites;
    name: string;
  }

  const { sprites, name }: Props = $props();

  const variants = $derived(
    [
      { key: "front_default", label: "Front", src: sprites.front_default },
      { key: "back_default", label: "Back", src: sprites.back_default },
      { key: "front_shiny", label: "Shiny front", src: sprites.front_shiny },
      { key: "back_shiny", label: "Shiny back", src: sprites.back_shiny },
    ].filter((v) => v.src)
  );

  // oxlint-disable-next-line prefer-const
  let active = $state(0);

  const focusTab = (container: HTMLElement, index: number) => {
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[index]?.focus();
  };

  const handleKeydown = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") {
      next = (index + 1) % variants.length;
    } else if (event.key === "ArrowLeft") {
      next = (index - 1 + variants.length) % variants.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = variants.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    active = next;
    const container = (event.currentTarget as HTMLElement).parentElement;
    if (container) {
      focusTab(container, next);
    }
  };
</script>

{#if variants.length > 0}
  <div class="sprite-switcher">
    <div class="sprite-switcher__preview" role="tabpanel" id="sprite-panel" tabindex="-1">
      <PokemonImage src={variants[active]?.src} alt={`${name} — ${variants[active]?.label}`} size={96} eager />
    </div>
    <div class="sprite-switcher__tabs" role="tablist" aria-label="Sprite variant">
      {#each variants as variant, i (variant.key)}
        <button
          type="button"
          role="tab"
          aria-controls="sprite-panel"
          aria-selected={active === i}
          tabindex={active === i ? 0 : -1}
          class="sprite-switcher__tab"
          class:sprite-switcher__tab--active={active === i}
          onclick={() => (active = i)}
          onkeydown={(event) => handleKeydown(event, i)}
        >
          {variant.label}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .sprite-switcher {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .sprite-switcher__preview {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-hover);
    border-radius: 0.75rem;
  }

  .sprite-switcher__tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem;
  }

  .sprite-switcher__tab {
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--surface-hover);
    transition: color 150ms var(--ease-out), background-color 150ms var(--ease-out);
  }

  .sprite-switcher__tab--active {
    color: var(--accent-contrast);
    background: var(--accent-text-bg);
  }

  @media (prefers-reduced-motion: reduce) {
    .sprite-switcher__tab {
      transition: none;
    }
  }
</style>
