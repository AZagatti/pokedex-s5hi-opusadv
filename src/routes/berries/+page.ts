import { getBerryList } from "$lib/api/client";

import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async () => {
  const first = await getBerryList(1, 0);
  const list = await getBerryList(first.count, 0);
  return { berries: list.results };
};
