import {
  getEvolutionChain,
  getPokemon,
  getPokemonSpecies,
} from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
  try {
    const pokemon = await getPokemon(params.name);
    const species = await getPokemonSpecies(pokemon.species.name);
    const evolutionChain = await getEvolutionChain(species.evolution_chain.url);
    return { evolutionChain, pokemon, species };
  } catch {
    return error(404, `${params.name} was not found`);
  }
};
