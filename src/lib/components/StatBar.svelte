<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "$lib/utils/motion";

  interface Props {
    label: string;
    value: number;
    max?: number;
  }

  const { label, value, max = 255 }: Props = $props();
  const percent = $derived(Math.min(100, Math.round((value / max) * 100)));

  let width = $state(0);

  onMount(() => {
    if (prefersReducedMotion()) {
      width = percent;
      return;
    }
    const frame = requestAnimationFrame(() => {
      width = percent;
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

<div class="stat-bar">
  <span class="stat-bar__label">{label}</span>
  <div class="stat-bar__track">
    <div class="stat-bar__fill" style:width={`${width}%`}></div>
  </div>
  <span class="stat-bar__value">{value}</span>
</div>

<style>
  .stat-bar {
    display: grid;
    grid-template-columns: 7rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
  }

  .stat-bar__label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: capitalize;
  }

  .stat-bar__track {
    height: 0.5rem;
    border-radius: 999px;
    background: var(--surface-hover);
    overflow: hidden;
  }

  .stat-bar__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent), white 30%));
    transition: width 800ms var(--ease-out);
  }

  .stat-bar__value {
    font-size: 0.85rem;
    font-weight: 600;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .stat-bar__fill {
      transition: none;
    }
  }
</style>
