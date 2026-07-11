import { getBerryList } from "$lib/api/client";

import type { PageLoad } from "./$types";

export const prerender = true;
// Same LCP fix as "/": unlike a dynamic route, this page has no per-item
// fetch and no client-side re-fetch on mount, so overriding ssr=false (root
// layout) here has no seeding/guard complexity — the berry grid is simply
// baked into the prerendered HTML instead of waiting on a client fetch.
export const ssr = true;

export const load: PageLoad = async () => {
  const first = await getBerryList(1, 0);
  const list = await getBerryList(first.count, 0);
  return { berries: list.results };
};
