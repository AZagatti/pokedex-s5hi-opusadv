import { clearApiCache } from "$lib/api/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCandidates, sortByDex } from "./candidates";

const jsonResponse = (body: unknown) => Response.json(body);

describe("pokemon: candidates", () => {
  beforeEach(() => {
    clearApiCache();
    vi.restoreAllMocks();
  });

  it("returns null when no filter is active", async () => {
    const result = await getCandidates({
      generationId: null,
      search: "",
      types: [],
    });
    expect(result).toBeNull();
  });

  it("intersects generation and unions selected types", async () => {
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes("/type/fire")) {
        return Promise.resolve(
          jsonResponse({
            id: 10,
            name: "fire",
            pokemon: [
              {
                pokemon: {
                  name: "charmander",
                  url: "https://pokeapi.co/api/v2/pokemon/4/",
                },
                slot: 1,
              },
              {
                pokemon: {
                  name: "vulpix",
                  url: "https://pokeapi.co/api/v2/pokemon/37/",
                },
                slot: 1,
              },
            ],
          })
        );
      }
      if (url.includes("/generation/1")) {
        return Promise.resolve(
          jsonResponse({
            id: 1,
            name: "generation-i",
            pokemon_species: [
              {
                name: "charmander",
                url: "https://pokeapi.co/api/v2/pokemon-species/4/",
              },
              {
                name: "bulbasaur",
                url: "https://pokeapi.co/api/v2/pokemon-species/1/",
              },
            ],
          })
        );
      }
      throw new Error(`Unexpected URL in test: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCandidates({
      generationId: 1,
      search: "",
      types: ["fire"],
    });

    expect(result?.map((r) => r.name)).toStrictEqual(["charmander"]);
  });

  it("filters by search substring", async () => {
    vi.stubGlobal(
      "fetch",
      // A fresh Response is required per call since each body can only be read once.
      // oxlint-disable-next-line vitest/prefer-mock-promise-shorthand, vitest/prefer-mock-return-shorthand
      vi.fn<typeof fetch>().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            count: 2,
            next: null,
            previous: null,
            results: [
              {
                name: "charmander",
                url: "https://pokeapi.co/api/v2/pokemon/4/",
              },
              { name: "squirtle", url: "https://pokeapi.co/api/v2/pokemon/7/" },
            ],
          })
        )
      )
    );

    const result = await getCandidates({
      generationId: null,
      search: "char",
      types: [],
    });

    expect(result?.map((r) => r.name)).toStrictEqual(["charmander"]);
  });
});

describe("pokemon: sortByDex", () => {
  it("orders by the numeric id in the resource URL", () => {
    const sorted = sortByDex([
      { name: "b", url: "https://pokeapi.co/api/v2/pokemon/25/" },
      { name: "a", url: "https://pokeapi.co/api/v2/pokemon/1/" },
    ]);

    expect(sorted.map((r) => r.name)).toStrictEqual(["a", "b"]);
  });
});
