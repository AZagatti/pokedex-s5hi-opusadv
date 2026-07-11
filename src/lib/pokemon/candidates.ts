import {
  getGeneration,
  getPokemonList,
  getType,
  idFromUrl,
} from "$lib/api/client";
import type { NamedResource } from "$lib/api/schemas";

let fullListPromise: Promise<NamedResource[]> | null = null;

/** The flat name+url list of every Pokémon, fetched once and cached for the session. */
export const getAllPokemonNames = (): Promise<NamedResource[]> => {
  if (!fullListPromise) {
    fullListPromise = (async () => {
      const first = await getPokemonList(1, 0);
      const all = await getPokemonList(first.count, 0);
      return all.results;
    })();
  }
  return fullListPromise;
};

export interface CandidateFilters {
  search: string;
  generationId: number | null;
  types: string[];
}

/**
 * Resolves the candidate name+url pool for the given filters.
 * Returns `null` when no filter is active, meaning callers should fall back
 * to the cheaper server-paginated `/pokemon` browse mode instead.
 */
export const getCandidates = async (
  filters: CandidateFilters,
  { includeAllWhenEmpty = false }: { includeAllWhenEmpty?: boolean } = {}
): Promise<NamedResource[] | null> => {
  const { search, generationId, types } = filters;
  const hasFilter =
    search.trim().length > 0 || generationId !== null || types.length > 0;

  if (!(hasFilter || includeAllWhenEmpty)) {
    return null;
  }

  let pool: NamedResource[];

  if (types.length > 0) {
    const typeDetails = await Promise.all(types.map((type) => getType(type)));
    const byName = new Map<string, NamedResource>();
    for (const detail of typeDetails) {
      for (const entry of detail.pokemon) {
        byName.set(entry.pokemon.name, entry.pokemon);
      }
    }
    pool = [...byName.values()];
  } else {
    pool = await getAllPokemonNames();
  }

  if (generationId !== null) {
    const generation = await getGeneration(generationId);
    const genNames = new Set(
      generation.pokemon_species.map((species) => species.name)
    );
    pool = pool.filter((entry) => genNames.has(entry.name));
  }

  if (search.trim().length > 0) {
    const query = search.trim().toLowerCase();
    pool = pool.filter((entry) => entry.name.includes(query));
  }

  return pool;
};

export const sortByDex = (items: NamedResource[]): NamedResource[] =>
  items.toSorted((a, b) => idFromUrl(a.url) - idFromUrl(b.url));
