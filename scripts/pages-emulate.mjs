import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const { extname, join } = path;

// Emulates GitHub Pages project-site hosting for local verification:
// serves build/ under /pokedex-s5hi-opusadv/ and serves 404.html (status 404)
// for any path with no matching file, exactly like GH Pages' SPA fallback.
const BASE = "/pokedex-s5hi-opusadv";
const ROOT = join(import.meta.dirname, "..", "build");
const PORT = Number(process.env.PORT ?? 4174);

const MIME = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404).end("Not found (outside base path)");
    return;
  }
  let relPath = url.pathname.slice(BASE.length) || "/";
  if (relPath.endsWith("/")) {
    relPath += "index.html";
  }
  const filePath = join(ROOT, relPath);

  try {
    const info = await stat(filePath);
    if (info.isFile()) {
      const body = await readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
      });
      res.end(body);
      return;
    }
  } catch {
    // fall through to 404.html
  }

  const fallback = await readFile(join(ROOT, "404.html"));
  res.writeHead(404, { "content-type": "text/html" });
  res.end(fallback);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving ${ROOT} at http://127.0.0.1:${PORT}${BASE}/`);
});
