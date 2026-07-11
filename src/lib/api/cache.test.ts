import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { cachedFetch, clearApiCache } from "./cache";

const schema = z.object({ value: z.number() });

describe("cache: cachedFetch", () => {
  beforeEach(() => {
    clearApiCache();
    vi.restoreAllMocks();
  });

  it("parses and returns the response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(Response.json({ value: 1 }))
    );

    const result = await cachedFetch("https://example.test/a", schema);

    expect(result).toStrictEqual({ value: 1 });
  });

  it("only fetches once per URL", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ value: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    await cachedFetch("https://example.test/b", schema);
    await cachedFetch("https://example.test/b", schema);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("throws and evicts the cache entry on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 500 }))
    );

    await expect(cachedFetch("https://example.test/c", schema)).rejects.toThrow(
      "Request to https://example.test/c failed with status 500"
    );

    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(Response.json({ value: 3 }))
    );
    await expect(
      cachedFetch("https://example.test/c", schema)
    ).resolves.toStrictEqual({
      value: 3,
    });
  });

  it("throws when the response fails schema validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(Response.json({ value: "nope" }))
    );

    await expect(cachedFetch("https://example.test/d", schema)).rejects.toThrow(
      z.ZodError
    );
  });
});
