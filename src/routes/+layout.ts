// Every route renders a prerendered static shell, then hydrates and fetches
// PokeAPI data purely in the browser. This keeps the build decoupled from
// PokeAPI uptime/staleness and lets adapter-static's fallback serve dynamic
// segments like /pokemon/[name] client-side.
export const prerender = true;
export const ssr = false;
