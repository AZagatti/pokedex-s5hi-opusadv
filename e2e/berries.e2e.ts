import { expect } from "@playwright/test";

import { gotoAndWaitReady, test } from "./fixtures";

test.describe("Berries", () => {
  test("list links to a detail page with firmness, flavors, and size", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/berries");
    await expect(
      page.getByRole("heading", { level: 1, name: "Berries" })
    ).toBeVisible();

    const cheriLink = page.getByRole("link", { name: "Cheri" });
    await expect(cheriLink).toBeVisible();
    await cheriLink.click();

    await expect(page).toHaveURL(/\/berries\/cheri$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Cheri" })
    ).toBeVisible();
    await expect(page.getByText("firmness", { exact: false })).toBeVisible();
    await expect(page.getByText("Growth time")).toBeVisible();
    await expect(page.getByText("Size")).toBeVisible();

    await page.getByRole("link", { name: "Back to Berries" }).click();
    await expect(page).toHaveURL(/\/berries$/u);
  });
});
