import { expect } from "@playwright/test";

import { test } from "./fixtures";

test.describe("404 page", () => {
  test.use({
    // Deliberately visiting a missing route logs the browser's own 404
    // resource error plus SvelteKit's client router "not found" message;
    // both are the expected result of this test, not a regression.
    consoleErrorAllowlist: { patterns: [/404/u, /Not found:/u] },
  });

  test("shows a not-found page with a link back to the Pokédex", async ({
    page,
  }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("link", { name: /Back to the Pokédex/u })
    ).toBeVisible();
    await page.getByRole("link", { name: /Back to the Pokédex/u }).click();
    await expect(page).toHaveURL(/\/$/u);
  });
});
