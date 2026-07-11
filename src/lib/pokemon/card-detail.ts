import type { Pokemon } from "$lib/api/schemas";

/** The subset of a Pokemon's data that `<PokemonCard>` actually renders. A
 * full `Pokemon` satisfies this shape too, so callers that already have one
 * (e.g. after an infinite-scroll fetch) can pass it straight through. */
export interface CardDetail {
  id: Pokemon["id"];
  sprites: { front_default: Pokemon["sprites"]["front_default"] };
  types: Pokemon["types"];
}
