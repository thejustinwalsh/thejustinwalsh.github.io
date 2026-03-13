/**
 * Chasm palette accent hex values — single source of truth for
 * any context that needs raw hex colors (SVG generation, canvas, etc.).
 * CSS usage should prefer the corresponding custom properties (--color-cyan, etc.).
 */
export const ACCENT_HEX = {
  cyan: "#5efdf7",
  pink: "#ff5dcc",
  yellow: "#fdfe89",
  blue: "#5fa1e7",
  orchid: "#ab58a8",
  mint: "#8dd894",
  peach: "#f3a787",
} as const;

export type AccentName = keyof typeof ACCENT_HEX;

/**
 * Deterministic tag → color mapping using our Chasm palette.
 * Hashes tag name to pick from a curated subset of accent colors
 * that have sufficient contrast on dark surfaces.
 */

const TAG_PALETTE = [
  "cyan",
  "pink",
  "yellow",
  "blue",
  "mint",
  "peach",
  "rose",
  "teal",
  "indigo",
  "seafoam",
  "sky",
  "cream",
  "orchid",
  "purple",
  "steel",
  "slate",
  "grape",
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Returns the CSS custom property reference for a tag's color: `var(--color-cyan)` etc. */
export function tagColor(tag: string): string {
  const idx = hash(tag.toLowerCase().trim()) % TAG_PALETTE.length;
  return `var(--color-${TAG_PALETTE[idx]})`;
}

/** Returns the palette token name for a tag: `cyan`, `pink`, etc. */
export function tagColorName(tag: string): string {
  const idx = hash(tag.toLowerCase().trim()) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

/**
 * Page accent colors — each section of the site gets its own accent
 * for visual distinction while staying within the palette.
 */
export const PAGE_ACCENTS = {
  home: "cyan",
  projects: "pink",
  devlog: "yellow",
  articles: "blue",
} as const;

export type PageAccent = keyof typeof PAGE_ACCENTS;

export function pageAccentVar(page: PageAccent): string {
  return `var(--color-${PAGE_ACCENTS[page]})`;
}
