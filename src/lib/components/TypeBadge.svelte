<script lang="ts">
  import { getReadableTextColor, getTypeColor } from "$lib/constants/type-colors";

  interface Props {
    type: string;
    size?: "sm" | "md";
  }

  const { type, size = "md" }: Props = $props();
  const color = $derived(getTypeColor(type));
  const textColor = $derived(getReadableTextColor(color));
</script>

<span
  class="type-badge"
  class:type-badge--sm={size === "sm"}
  class:type-badge--dark-text={textColor !== "#ffffff"}
  style:background={`linear-gradient(135deg, ${color}, color-mix(in srgb, ${color}, black 25%))`}
  style:color={textColor}
>
  {type}
</span>

<style>
  .type-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: capitalize;
    text-shadow: 0 1px 1px rgb(0 0 0 / 25%);
    box-shadow: var(--shadow-sm);
    line-height: 1.4;
  }

  .type-badge--dark-text {
    text-shadow: 0 1px 1px rgb(255 255 255 / 25%);
  }

  .type-badge--sm {
    padding: 0.2rem 0.55rem;
    font-size: 0.65rem;
  }
</style>
