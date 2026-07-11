import { z } from "zod";

export const namedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type NamedResource = z.infer<typeof namedResourceSchema>;

export const paginatedListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedResourceSchema),
});
export type PaginatedList = z.infer<typeof paginatedListSchema>;

const officialArtworkSchema = z.object({
  front_default: z.string().nullable(),
});

const pokemonSpritesSchema = z.object({
  back_default: z.string().nullable(),
  back_shiny: z.string().nullable(),
  front_default: z.string().nullable(),
  front_shiny: z.string().nullable(),
  other: z
    .object({
      "official-artwork": officialArtworkSchema.optional(),
    })
    .partial()
    .optional(),
});
export type PokemonSprites = z.infer<typeof pokemonSpritesSchema>;

const pokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: namedResourceSchema,
});

const pokemonAbilitySchema = z.object({
  ability: namedResourceSchema,
  is_hidden: z.boolean(),
  slot: z.number(),
});

const pokemonStatSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: namedResourceSchema,
});

const pokemonMoveSchema = z.object({
  move: namedResourceSchema,
});

const pokemonCriesSchema = z.object({
  latest: z.string().nullable().optional(),
  legacy: z.string().nullable().optional(),
});

export const pokemonSchema = z.object({
  abilities: z.array(pokemonAbilitySchema),
  cries: pokemonCriesSchema.optional(),
  height: z.number(),
  id: z.number(),
  moves: z.array(pokemonMoveSchema),
  name: z.string(),
  species: namedResourceSchema,
  sprites: pokemonSpritesSchema,
  stats: z.array(pokemonStatSchema),
  types: z.array(pokemonTypeSlotSchema),
  weight: z.number(),
});
export type Pokemon = z.infer<typeof pokemonSchema>;

const flavorTextEntrySchema = z.object({
  flavor_text: z.string(),
  language: namedResourceSchema,
});

export const pokemonSpeciesSchema = z.object({
  evolution_chain: z.object({ url: z.string() }),
  flavor_text_entries: z.array(flavorTextEntrySchema),
  id: z.number(),
  name: z.string(),
});
export type PokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;

const evolutionDetailSchema = z.object({
  min_level: z.number().nullable(),
  trigger: namedResourceSchema.nullable(),
});

export interface EvolutionChainLink {
  species: NamedResource;
  evolution_details: z.infer<typeof evolutionDetailSchema>[];
  evolves_to: EvolutionChainLink[];
}

const evolutionChainLinkSchema: z.ZodType<EvolutionChainLink> = z.lazy(() =>
  z.object({
    evolution_details: z.array(evolutionDetailSchema),
    evolves_to: z.array(evolutionChainLinkSchema),
    species: namedResourceSchema,
  })
);

export const evolutionChainSchema = z.object({
  chain: evolutionChainLinkSchema,
  id: z.number(),
});
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;

export const typeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedResourceSchema,
      slot: z.number(),
    })
  ),
});
export type TypeDetail = z.infer<typeof typeDetailSchema>;

export const generationDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedResourceSchema),
});
export type GenerationDetail = z.infer<typeof generationDetailSchema>;

export const berrySchema = z.object({
  firmness: namedResourceSchema,
  flavors: z.array(
    z.object({
      flavor: namedResourceSchema,
      potency: z.number(),
    })
  ),
  growth_time: z.number(),
  id: z.number(),
  max_harvest: z.number(),
  name: z.string(),
  natural_gift_power: z.number(),
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
});
export type Berry = z.infer<typeof berrySchema>;
