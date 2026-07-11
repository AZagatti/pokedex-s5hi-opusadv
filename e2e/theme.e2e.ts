import { expect } from "@playwright/test";

import { gotoAndWaitReady, test } from "./fixtures";

test.describe("Theme toggle", () => {
  test("toggling to dark persists across reload", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
