import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "./concurrency";

describe("utils: mapWithConcurrency", () => {
  it("maps every item and preserves order", async () => {
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, (n) =>
      Promise.resolve(n * 2)
    );

    expect(result).toStrictEqual([2, 4, 6, 8, 10]);
  });

  it("never runs more than `limit` calls concurrently", async () => {
    let active = 0;
    let maxActive = 0;

    await mapWithConcurrency(
      Array.from({ length: 10 }, (_, i) => i),
      3,
      async (n) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        // oxlint-disable-next-line promise/avoid-new
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1);
        });
        active -= 1;
        return n;
      }
    );

    expect(maxActive).toBeLessThanOrEqual(3);
  });
});
