import { describe, expect, it } from "vitest";

import { idFromUrl } from "./client";

describe("client: idFromUrl", () => {
  it("extracts the trailing numeric id from a PokeAPI resource URL", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(idFromUrl("https://pokeapi.co/api/v2/generation/1/")).toBe(1);
  });

  it("returns NaN when there is no trailing id", () => {
    expect(
      Number.isNaN(idFromUrl("https://pokeapi.co/api/v2/pokemon"))
    ).toBeTruthy();
  });
});
