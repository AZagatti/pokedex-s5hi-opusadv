/** "fire-blast" -> "Fire Blast" */
export const formatName = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
