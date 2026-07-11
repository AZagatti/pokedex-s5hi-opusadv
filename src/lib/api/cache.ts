interface Parseable<T> {
  parse: (data: unknown) => T;
}

const cache = new Map<string, Promise<unknown>>();

/**
 * Fetches `url`, validates the JSON body against `schema`, and caches the
 * resulting promise by URL so repeat/concurrent requests for the same
 * resource never hit the network twice.
 */
export const cachedFetch = <T>(
  url: string,
  schema: Parseable<T>
): Promise<T> => {
  const cached = cache.get(url);
  if (cached) {
    return cached as Promise<T>;
  }

  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Request to ${url} failed with status ${response.status}`
        );
      }
      const data = await response.json();
      return schema.parse(data);
    } catch (error) {
      cache.delete(url);
      throw error;
    }
  })();

  cache.set(url, promise);
  return promise as Promise<T>;
};

export const clearApiCache = (): void => {
  cache.clear();
};
