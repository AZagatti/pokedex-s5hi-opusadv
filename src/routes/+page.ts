import { getPokemon, getPokemonList } from "$lib/api/client";
import type { Pokemon } from "$lib/api/schemas";
import type { CardDetail } from "$lib/pokemon/card-detail";

import type { PageLoad } from "./$types";

// Every other route is CSR-only (see root +layout.ts), but "/" pays for that
// with an empty-shell FCP and a 30-request waterfall before its first card
// can paint. Overriding ssr here bakes the first page of results into the
// prerendered HTML, so the grid (including the LCP image) is visible before
// any client JS runs. Client-side infinite scroll/search/filter is unchanged.
export const ssr = true;

const PAGE_SIZE = 30;

export interface InitialEntry {
  name: string;
  url: string;
  detail: CardDetail | null;
}

const toCardDetail = (pokemon: Pokemon): CardDetail => ({
  id: pokemon.id,
  sprites: { front_default: pokemon.sprites.front_default },
  types: pokemon.types,
});

export const load: PageLoad = async () => {
  try {
    const list = await getPokemonList(PAGE_SIZE, 0);
    const details = await Promise.all(
      list.results.map(async (result) => {
        try {
          return await getPokemon(result.name);
        } catch {
          return null;
        }
      })
    );
    const initialEntries: InitialEntry[] = list.results.map((result, i) => ({
      detail: details[i] ? toCardDetail(details[i] as Pokemon) : null,
      name: result.name,
      url: result.url,
    }));
    return { initialEntries, initialHasMore: list.next !== null };
  } catch {
    // A PokeAPI blip at build/prerender time degrades to the pre-existing
    // client-side fetch on mount rather than failing the whole build.
    return { initialEntries: [] as InitialEntry[], initialHasMore: true };
  }
};
