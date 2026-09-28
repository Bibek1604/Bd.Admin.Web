/** A lazy import failing because the deployed chunk hash changed. */
export const isChunkLoadError = (error: unknown): boolean =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    String((error as Error)?.message ?? error),
  );

