<div class="skeleton-card" aria-hidden="true">
  <div class="skeleton-card__dex"></div>
  <div class="skeleton-card__image"></div>
  <div class="skeleton-card__name"></div>
  <div class="skeleton-card__types"></div>
</div>

<style>
  .skeleton-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem 1rem;
    border-radius: 1rem;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .skeleton-card > * {
    background: linear-gradient(
      90deg,
      var(--surface-hover) 25%,
      var(--border) 37%,
      var(--surface-hover) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 0.5rem;
  }

  .skeleton-card__dex {
    align-self: flex-start;
    width: 2.5rem;
    height: 0.85rem;
  }

  .skeleton-card__image {
    width: 96px;
    height: 96px;
    border-radius: 0.75rem;
  }

  .skeleton-card__name {
    width: 5rem;
    height: 1rem;
  }

  .skeleton-card__types {
    width: 6rem;
    height: 1.25rem;
    border-radius: 999px;
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-card > * {
      animation: none;
    }
  }
</style>
