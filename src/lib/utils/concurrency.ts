/** Runs `fn` over `items` with at most `limit` in-flight calls at once. */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results: R[] = Array.from({ length: items.length });
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // Sequential by design: each worker processes its slice one at a time
      // so that at most `limit` workers (and therefore requests) run at once.
      // oxlint-disable-next-line no-await-in-loop
      results[index] = await fn(items[index] as T, index);
    }
  };

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
};
