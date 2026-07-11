<script lang="ts">
  import { resolve } from "$app/paths";
  import { berrySpriteUrl } from "$lib/api/client";
  import { formatName } from "$lib/utils/format";

  interface Props {
    name: string;
  }

  const { name }: Props = $props();
  const itemName = $derived(`${name}-berry`);
</script>

<a href={resolve(`/berries/${name}`)} class="berry-card">
  <img src={berrySpriteUrl(itemName)} alt="" width="64" height="64" loading="lazy" decoding="async" />
  <p class="berry-card__name">{formatName(name)}</p>
</a>

<style>
  .berry-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    border-radius: 1rem;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    transition:
      transform 200ms var(--ease-out),
      box-shadow 200ms var(--ease-out);
  }

  .berry-card img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .berry-card__name {
    font-weight: 600;
    text-transform: capitalize;
  }

  .berry-card:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .berry-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .berry-card {
      transition: none;
    }
    .berry-card:hover {
      transform: none;
    }
  }
</style>
