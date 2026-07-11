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
    // Explicit --host 127.0.0.1 and polling the same literal address (rather
    // than Playwright's default "localhost", whose DNS resolution can pick a
    // different loopback interface than the one below on some CI runners)
    // keeps the readiness check and baseURL pointed at the exact same socket.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    reuseExistingServer: false,
    url: `http://127.0.0.1:${PORT}`,
  },
});
