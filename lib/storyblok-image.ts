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
  if (!ASSET_URL.test(src)) return src;
  return `${src}/m/${width}x0/filters:format(webp):quality(${quality ?? 80})`;
}
