import { expect } from "@playwright/test";

import { gotoAndWaitReady, test } from "./fixtures";

test.describe("Favorites", () => {
  test("adding a favorite on the detail page persists across reload", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/favorites");
    await expect(
      page.getByText("You haven't favorited any Pokémon yet.")
    ).toBeVisible();

    await gotoAndWaitReady(page, "/pokemon/charmander");
    await page
      .getByRole("button", { name: "Add charmander to favorites" })
      .click();
    await expect(
      page.getByRole("button", { name: "Remove charmander from favorites" })
    ).toBeVisible();

    await gotoAndWaitReady(page, "/favorites");
    await expect(
      page.getByRole("link", { name: /View Charmander/u })
    ).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("link", { name: /View Charmander/u })
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Remove charmander from favorites" })
      .click();
    await expect(
      page.getByText("You haven't favorited any Pokémon yet.")
    ).toBeVisible();
  });
});
