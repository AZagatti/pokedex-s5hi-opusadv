import { expect } from "@playwright/test";

import { gotoAndWaitReady, test } from "./fixtures";

test.describe("Pokémon detail", () => {
  test("shows stats, abilities, and an evolution chain that navigates", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/pokemon/charmander");

    await expect(
      page.getByRole("heading", { level: 1, name: "Charmander" })
    ).toBeVisible();
    // Type badge text is lowercase in the DOM; CSS applies capitalize purely visually.
    await expect(page.getByText("fire", { exact: true })).toBeVisible();
    await expect(page.getByText("Base stats", { exact: false })).toBeVisible();
    await expect(page.getByText("Hp", { exact: true })).toBeVisible();

    const evolutionLink = page.getByRole("link", { name: /Charmeleon/u });
    await expect(evolutionLink).toBeVisible();
    await evolutionLink.click();

    await expect(
      page.getByRole("heading", { level: 1, name: "Charmeleon" })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/pokemon\/charmeleon$/u);
  });

  test("back link returns to the list", async ({ page }) => {
    await gotoAndWaitReady(page, "/pokemon/charmander");
    await page.getByRole("link", { name: "Back to Pokédex" }).click();
    await expect(page).toHaveURL(/\/$/u);
    await expect(
      page.getByRole("link", { name: /View Bulbasaur/u })
    ).toBeVisible();
  });
});
