import type { Action } from "svelte/action";

/** Calls `callback` whenever the node scrolls into view (used for infinite scroll sentinels). */
// The IntersectionObserver and Svelte action APIs are inherently callback-based.
// oxlint-disable-next-line promise/prefer-await-to-callbacks
export const inViewport: Action<HTMLElement, () => void> = (node, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        // oxlint-disable-next-line promise/prefer-await-to-callbacks
        return callback();
      }
    },
    { rootMargin: "600px" }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};
