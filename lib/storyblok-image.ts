// Utilitaires pour les images hébergées par Storyblok (a.storyblok.com).
// Sans dépendance serveur : utilisables aussi dans les composants client.

// Les URL d'assets contiennent les dimensions d'origine :
// https://a.storyblok.com/f/<espace>/<largeur>x<hauteur>/<hash>/<nom>.jpg
const ASSET_URL = /^https:\/\/a\.storyblok\.com\/f\/\d+\/(\d+)x(\d+)\/[^/?#]+\/[^/?#]+$/;

/** Dimensions d'origine lues dans l'URL, ou `null` si l'URL n'est pas un asset Storyblok. */
export function storyblokImageSize(url?: string): { width: number; height: number } | null {
  const m = url ? ASSET_URL.exec(url) : null;
  if (!m) return null;
  const width = Number(m[1]);
  const height = Number(m[2]);
  return width > 0 && height > 0 ? { width, height } : null;
}

/** Rapport largeur / hauteur lu dans l'URL, ou `undefined` si inconnu. */
export function storyblokImageRatio(url?: string): number | undefined {
  const size = storyblokImageSize(url);
  return size ? size.width / size.height : undefined;
}

const MAX_WIDTH = 3840;

// WebP qualité 90 : conserve le grain des photos (à 80, il est lissé).
const DEFAULT_QUALITY = 90;

/**
 * Loader `next/image` : sert l'image redimensionnée par le service d'images de
 * Storyblok (https://www.storyblok.com/docs/api/image-service), sans passer par
 * l'optimiseur de Next. Les URL qui ne viennent pas de Storyblok sont renvoyées telles quelles.
 */
export function storyblokImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const size = storyblokImageSize(src);
  if (!size) return src;
  // Jamais plus large que l'original, ni que 3840 px (la plus grande largeur proposée par next/image).
  const w = Math.min(width, size.width, MAX_WIDTH);
  return `${src}/m/${w}x0/filters:format(webp):quality(${quality ?? DEFAULT_QUALITY})`;
}
