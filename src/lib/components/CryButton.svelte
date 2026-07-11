<script lang="ts">
  import { Volume2 } from "lucide-svelte";

  interface Props {
    src: string;
    name: string;
  }

  const { src, name }: Props = $props();
  let playing = $state(false);

  const play = async () => {
    const audio = new Audio(src);
    playing = true;
    audio.addEventListener("ended", () => {
      playing = false;
    });
    try {
      await audio.play();
    } catch {
      playing = false;
    }
  };
</script>

<button
  type="button"
  class="cry-button"
  class:cry-button--playing={playing}
  aria-label={`Play cry for ${name}`}
  onclick={play}
>
  <Volume2 size={18} aria-hidden="true" />
  Play cry
</button>

<style>
  .cry-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: var(--surface-hover);
    color: var(--text);
    font-weight: 500;
    font-size: 0.85rem;
    transition: transform 150ms var(--ease-out);
  }

  .cry-button--playing {
    color: var(--accent);
  }

  .cry-button:active {
    transform: scale(0.95);
  }

  @media (prefers-reduced-motion: reduce) {
    .cry-button {
      transition: none;
    }
  }
</style>
