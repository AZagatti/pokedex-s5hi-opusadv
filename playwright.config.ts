import { defineConfig } from "@playwright/test";

// A fixed, less-common port with strictPort + reuseExistingServer: false avoids
// silently attaching to an unrelated server already bound to a common port
// like 4173 on a shared host. Confirmed reachable locally: some sandboxes on
// this host only allow loopback traffic on a narrow port range (4173-4179
// worked, 8080 and 4317 silently timed out), so stay in that known-good band.
const PORT = 4176;

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
