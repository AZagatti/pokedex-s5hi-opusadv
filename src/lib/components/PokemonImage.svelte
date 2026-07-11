<script lang="ts">
  interface Props {
    src: string | null | undefined;
    alt: string;
    size?: number;
    eager?: boolean;
  }

  const { src, alt, size = 120, eager = false }: Props = $props();
</script>

{#if src}
  <img
    {src}
    {alt}
    width={size}
    height={size}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    class="pokemon-image"
    style:width={`${size}px`}
    style:height={`${size}px`}
  />
{:else}
  <div class="pokemon-image pokemon-image--placeholder" style:width={`${size}px`} style:height={`${size}px`} role="img" aria-label={alt}>
    ?
  </div>
{/if}

<style>
  .pokemon-image {
    object-fit: contain;
    image-rendering: crisp-edges;
  }

  .pokemon-image--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-hover);
    border-radius: 0.75rem;
    color: var(--text-muted);
    font-size: 1.5rem;
    font-weight: 700;
  }
</style>
