export const TYPE_COLORS: Record<string, string> = {
  bug: "#a7b723",
  dark: "#75574c",
  dragon: "#7037ff",
  electric: "#fbd100",
  fairy: "#e69eac",
  fighting: "#c12239",
  fire: "#f57d31",
  flying: "#a891ec",
  ghost: "#70559b",
  grass: "#74cb48",
  ground: "#dec16b",
  ice: "#9ad6df",
  normal: "#aaa67f",
  poison: "#a43e9e",
  psychic: "#fb5584",
  rock: "#b69e31",
  steel: "#b7b9d0",
  water: "#6493eb",
};

export const getTypeColor = (type: string): string =>
  TYPE_COLORS[type] ?? TYPE_COLORS.normal;

const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const LINEAR_OFFSET = 0.055;
const LINEAR_SCALE = 1.055;
const GAMMA = 2.4;

const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= LINEAR_THRESHOLD
    ? c / LINEAR_DIVISOR
    : ((c + LINEAR_OFFSET) / LINEAR_SCALE) ** GAMMA;
};

const relativeLuminance = (hex: string): number => {
  const r = toLinear(Number.parseInt(hex.slice(1, 3), 16));
  const g = toLinear(Number.parseInt(hex.slice(3, 5), 16));
  const b = toLinear(Number.parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a: number, b: number): number => {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
};

/** Picks black or white text — whichever contrasts better against `hex`. */
export const getReadableTextColor = (hex: string): string => {
  const luminance = relativeLuminance(hex);
  const contrastWithWhite = contrastRatio(luminance, 1);
  const contrastWithBlack = contrastRatio(luminance, 0);
  return contrastWithBlack > contrastWithWhite ? "#14151a" : "#ffffff";
};
