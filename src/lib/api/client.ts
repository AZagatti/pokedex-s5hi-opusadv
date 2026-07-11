import { cachedFetch } from "./cache";
import {
  berrySchema,
  evolutionChainSchema,
  generationDetailSchema,
  paginatedListSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  typeDetailSchema,
} from "./schemas";

export const API_BASE = "https://pokeapi.co/api/v2";

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const GENERATIONS = [
  { id: 1, name: "generation-i" },
  { id: 2, name: "generation-ii" },
  { id: 3, name: "generation-iii" },
  { id: 4, name: "generation-iv" },
  { id: 5, name: "generation-v" },
  { id: 6, name: "generation-vi" },
  { id: 7, name: "generation-vii" },
  { id: 8, name: "generation-viii" },
  { id: 9, name: "generation-ix" },
] as const;

const TRAILING_ID_PATTERN = /\/(?<id>\d+)\/?$/u;

/** PokeAPI resource URLs end with `/<resource>/<id>/`; extract the numeric id. */
export const idFromUrl = (url: string): number => {
  const match = TRAILING_ID_PATTERN.exec(url);
  return match?.groups?.id ? Number(match.groups.id) : Number.NaN;
};

export const getPokemonList = (limit: number, offset: number) =>
  cachedFetch(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    paginatedListSchema
  );

export const getPokemon = (nameOrId: string | number) =>
  cachedFetch(`${API_BASE}/pokemon/${nameOrId}`, pokemonSchema);

export const getPokemonSpecies = (nameOrId: string | number) =>
  cachedFetch(`${API_BASE}/pokemon-species/${nameOrId}`, pokemonSpeciesSchema);

export const getEvolutionChain = (url: string) =>
  cachedFetch(url, evolutionChainSchema);

export const getType = (name: string) =>
  cachedFetch(`${API_BASE}/type/${name}`, typeDetailSchema);

export const getGeneration = (id: number | string) =>
  cachedFetch(`${API_BASE}/generation/${id}`, generationDetailSchema);

export const getBerryList = (limit: number, offset: number) =>
  cachedFetch(
    `${API_BASE}/berry?limit=${limit}&offset=${offset}`,
    paginatedListSchema
  );

export const getBerry = (name: string) =>
  cachedFetch(`${API_BASE}/berry/${name}`, berrySchema);

export const berrySpriteUrl = (itemName: string): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
