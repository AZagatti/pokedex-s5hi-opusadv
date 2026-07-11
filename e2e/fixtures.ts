import type { Page } from "@playwright/test";
import { expect, test as base } from "@playwright/test";

interface ConsoleErrorAllowlist {
  patterns: (string | RegExp)[];
}

interface Fixtures {
  // Playwright's own fixture typing convention for a side-effect-only, no-value fixture.
  // oxlint-disable-next-line no-invalid-void-type
  failOnConsoleErrors: void;
  // Patterns for console/page errors that are expected for a given test (e.g.
  // the router logging a "not found" when a test deliberately visits a
  // missing route) and shouldn't fail the run. Wrapped in an object because
  // test.use() overrides fixture values via Object.assign, which spreads a
  // bare array's elements as separate merge sources instead of replacing it
  // wholesale — RegExp instances (no enumerable own properties) then vanish
  // entirely. A plain object with an array property doesn't hit that path.
  consoleErrorAllowlist: ConsoleErrorAllowlist;
}

export const test = base.extend<Fixtures>({
  consoleErrorAllowlist: [{ patterns: [] }],
  // Fails any test that logs an unexpected console/page error, so a future
  // hydration or runtime regression shows up as a test failure instead of
  // silently passing.
  failOnConsoleErrors: [
    async ({ page, consoleErrorAllowlist }, use) => {
      const errors: string[] = [];
      const isAllowed = (text: string) =>
        consoleErrorAllowlist.patterns.some((pattern) =>
          typeof pattern === "string"
            ? text.includes(pattern)
            : pattern.test(text)
        );

      page.on("console", (message) => {
        if (message.type() === "error" && !isAllowed(message.text())) {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        if (!isAllowed(error.message)) {
          errors.push(error.message);
        }
      });

      await use();

      expect(
        errors,
        `Unexpected console errors:\n${errors.join("\n")}`
      ).toEqual([]);
    },
    { auto: true },
  ],
});

// SSR (the "/" route) and instant client renders mean a page can look ready
// before Svelte has finished hydrating and attaching event listeners; an
// interaction fired in that window is silently a no-op. Waiting for network
// idle after navigation gives hydration a chance to complete first.
export const gotoAndWaitReady = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
