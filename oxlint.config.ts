import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import svelte from "ultracite/oxlint/svelte";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, svelte, vitest],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      // Svelte components use PascalCase filenames by convention.
      files: ["**/*.svelte"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
});
