// Vidéos envoyées par la page /admin/videos et stockées sur Cloudflare R2.
// Module sans dépendance serveur : utilisé par la page d'envoi, l'API et la
// conversion des blocs Storyblok (rendu public comme aperçu de l'éditeur).
//
// Nom d'un fichier envoyé : uploads/<nom-nettoye>-<suffixe>-<largeur>x<hauteur>.mp4
// avec, à côté, l'affiche (première image) au même nom en .jpg. Les dimensions
// dans le nom donnent le ratio dès le rendu serveur, sans attendre la vidéo.

export const UPLOAD_PREFIX = 'uploads/';

/** Poids maximal d'une vidéo envoyée (après compression éventuelle). */
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
/** Poids maximal d'une affiche. */
export const MAX_POSTER_BYTES = 2 * 1024 * 1024;
/** Durée maximale d'une vidéo, en secondes. */
export const MAX_VIDEO_SECONDS = 60;

/** En-tête de cache posé sur chaque fichier : les noms sont uniques, donc jamais réécrits. */
export const UPLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * Adresse r2.dev du bucket, celle des liens collés dans Storyblok avant le domaine définitif.
 * Au rendu, `publicVideoUrl` la remplace par VIDEOS_PUBLIC_BASE_URL : un lien collé une fois
 * reste valable après la bascule vers videos.gilanselmi.com et la fermeture de r2.dev.
 */
export const LEGACY_PUBLIC_ORIGIN = 'https://pub-077dd9d9d31e445e93c96024bb4992c6.r2.dev';

/**
 * Remplace l'origine r2.dev du bucket par VIDEOS_PUBLIC_BASE_URL (valeur figée au build par
 * next.config.ts, identique côté serveur et navigateur). Rien ne change si la variable est
 * vide, égale à l'ancienne origine, ou si l'adresse est relative (/videos/…) ou d'un autre hôte.
 * Seul le préfixe est remplacé : le reste de la chaîne (chemin déjà encodé) est conservé tel quel.
 */
export function publicVideoUrl(url: string): string;
export function publicVideoUrl(url: string | undefined): string | undefined;
export function publicVideoUrl(url: string | undefined): string | undefined {
  const base = (process.env.VIDEOS_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
  if (!url || !base || base === LEGACY_PUBLIC_ORIGIN) return url;
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return url; // adresse relative
  }
  if (origin !== LEGACY_PUBLIC_ORIGIN || !url.startsWith(LEGACY_PUBLIC_ORIGIN + '/')) return url;
  return base + url.slice(LEGACY_PUBLIC_ORIGIN.length);
}

const UPLOADED_VIDEO = /\/uploads\/[a-z0-9-]+-[a-z0-9]{6}-(\d{2,5})x(\d{2,5})\.mp4$/;
const UPLOADED_KEY = /^uploads\/[a-z0-9-]+-[a-z0-9]{6}-\d{2,5}x\d{2,5}\.mp4$/;

/** Dimensions et affiche d'une vidéo envoyée par la page d'envoi ; `null` pour toute autre URL. */
export function uploadedVideoInfo(url?: string): { width: number; height: number; poster: string } | null {
  if (!url) return null;
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return null;
  }
  const m = UPLOADED_VIDEO.exec(path);
  if (!m) return null;
  const width = Number(m[1]);
  const height = Number(m[2]);
  if (!(width > 0 && height > 0)) return null;
  return { width, height, poster: url.replace(/\.mp4$/, '.jpg') };
}

/** Vrai si la clé est celle d'une vidéo produite par `uploadKey`. */
export function isUploadKey(key: string): boolean {
  return UPLOADED_KEY.test(key);
}

/**
 * Nom de fichier nettoyé : sans extension, sans accents ni espaces, en minuscules,
 * lettres, chiffres et tirets seulement, 60 caractères au plus.
 */
export function cleanBaseName(fileName: string): string {
  const base = fileName.replace(/\.[^.]*$/, '');
  const clean = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return clean || 'video';
}

/** Clé R2 d'une nouvelle vidéo ; `suffix` : 6 caractères [a-z0-9] tirés au hasard. */
export function uploadKey(fileName: string, width: number, height: number, suffix: string): string {
  return `${UPLOAD_PREFIX}${cleanBaseName(fileName)}-${suffix}-${width}x${height}.mp4`;
}

/** Clé de l'affiche associée à une vidéo. */
export function posterKey(videoKey: string): string {
  return videoKey.replace(/\.mp4$/, '.jpg');
}
