<script lang="ts">
  import { Heart } from "lucide-svelte";
  import { favoritesStore } from "$lib/stores/favorites.svelte";

  interface Props {
    name: string;
  }

  const { name }: Props = $props();
  const isFavorite = $derived(favoritesStore.has(name));

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    favoritesStore.toggle(name);
  };
</script>

<button
  type="button"
  class="favorite-button"
  class:favorite-button--active={isFavorite}
  aria-pressed={isFavorite}
  aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
  onclick={handleClick}
>
  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
</button>

<style>
  .favorite-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    background: var(--surface);
    color: var(--text-muted);
    box-shadow: var(--shadow-sm);
    transition:
      color 150ms var(--ease-out),
      transform 150ms var(--ease-out);
    touch-action: manipulation;
  }

  .favorite-button--active {
    color: var(--accent);
  }

  .favorite-button:active {
    transform: scale(0.92);
  }

  @media (hover: hover) and (pointer: fine) {
    .favorite-button:hover {
      color: var(--accent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .favorite-button {
      transition: none;
    }
  }
</style>
