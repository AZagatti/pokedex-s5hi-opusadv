import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig(() => {
  // Only the GitHub Pages deploy build sets BASE_PATH (see .github/workflows/deploy.yml).
  // Local builds used for e2e/preview/Lighthouse stay at base '' so `vite preview` serves them at "/".
  const envBase = process.env.BASE_PATH;
  const base = envBase?.startsWith("/") ? (envBase as `/${string}`) : "";

  return {
    plugins: [
      tailwindcss(),
      sveltekit({
        adapter: adapter({
          assets: "build",
          fallback: "404.html",
          pages: "build",
          precompress: false,
          strict: true,
        }),
        compilerOptions: {
          // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
          runes: ({ filename }) =>
            filename.split(/[/\\]/u).includes("node_modules")
              ? undefined
              : true,
        },
        paths: {
          base,
        },
        prerender: {
          handleHttpError: "warn",
        },
      }),
    ],
    test: {
      expect: { requireAssertions: true },
      projects: [
        {
          extends: "./vite.config.ts",
          test: {
            environment: "node",
            exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
            include: ["src/**/*.{test,spec}.{js,ts}"],
            name: "server",
          },
        },
      ],
    },
  };
});
