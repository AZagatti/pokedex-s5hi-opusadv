import { defineConfig } from "@playwright/test";

// A fixed, less-common port with strictPort + reuseExistingServer: false avoids
// silently attaching to an unrelated server already bound to a common port
// like 4173 on a shared host.
const PORT = 4317;

export default defineConfig({
  testMatch: "**/*.e2e.{ts,js}",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
  },
});
