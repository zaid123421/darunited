/**
 * DARUNITED logo paths (URL-friendly copies).
 * Originals remain under public/logos/{Full version,Wordmark} and public/favicons/Submark.
 */
export const brandAssets = {
  full: {
    onDark: "/logos/full-red-white.png",
    onLight: "/logos/full-red-black.png",
    onRed: "/logos/full-white.png",
  },
  wordmark: {
    onDark: "/logos/wordmark-white.png",
    onLight: "/logos/wordmark-black.png",
    red: "/logos/wordmark-red.png",
  },
  submark: {
    onDark: "/favicons/submark-white.png",
    onLight: "/favicons/submark-black.png",
    red: "/favicons/submark-red.png",
  },
} as const;

export type BrandSurface = "on-dark" | "on-light" | "on-red";
export type BrandMarkKind = "full" | "wordmark" | "submark";

export function resolveBrandSrc(
  kind: BrandMarkKind,
  surface: BrandSurface,
): string {
  if (kind === "full") {
    if (surface === "on-red") return brandAssets.full.onRed;
    if (surface === "on-light") return brandAssets.full.onLight;
    return brandAssets.full.onDark;
  }

  if (kind === "wordmark") {
    if (surface === "on-red") return brandAssets.wordmark.onDark;
    if (surface === "on-light") return brandAssets.wordmark.onLight;
    return brandAssets.wordmark.onDark;
  }

  if (surface === "on-red") return brandAssets.submark.onDark;
  if (surface === "on-light") return brandAssets.submark.onLight;
  return brandAssets.submark.red;
}
