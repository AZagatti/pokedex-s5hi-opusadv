import { expect } from "@playwright/test";

import { gotoAndWaitReady, test } from "./fixtures";

test.describe("Pokédex list", () => {
  test("loads the first page of cards", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await expect(
      page.getByRole("link", { name: /View Bulbasaur/u })
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "bulbasaur" })).toBeVisible();
  });

  test("search narrows the grid to matching names", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await page
      .getByRole("searchbox", { name: "Search Pokémon by name" })
      .fill("pikachu");

    await expect(
      page.getByRole("link", { name: /View Pikachu,/u })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View Bulbasaur/u })
    ).toHaveCount(0);
  });

  test("a type filter narrows results, and clear filters resets them", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/");
    // Type chip labels are lowercase in the DOM; CSS applies capitalize purely visually.
    await page.getByRole("button", { exact: true, name: "fire" }).click();

    await expect(
      page.getByRole("link", { name: /View Charmander/u })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View Squirtle/u })
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(
      page.getByRole("link", { name: /View Squirtle/u })
    ).toBeVisible();
  });
});
