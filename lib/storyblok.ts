import "server-only";
import type { ISbStoryData } from "@storyblok/react/rsc";

const STORIES_ENDPOINT = "https://api.storyblok.com/v2/cdn/stories";

export type StoryVersion = "published" | "draft";

/** Étiquette de cache du contenu publié ; invalidée par le webhook. */
export const STORYBLOK_CACHE_TAG = "storyblok";

/** Échec de lecture Storyblok (réseau, jeton, réponse inattendue). */
export class StoryblokFetchError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "StoryblokFetchError";
    this.status = options?.status;
  }
}

/**
 * Jeton d'accès Storyblok (type « preview » : lit le publié et les brouillons).
 * Variable sans préfixe NEXT_PUBLIC_ et module marqué "server-only" : le jeton
 * ne peut pas se retrouver dans le JavaScript envoyé au navigateur.
 */
export function getStoryblokToken(): string {
  const token = process.env.STORYBLOK_PREVIEW_TOKEN;
  if (!token) {
    throw new StoryblokFetchError(
      "Jeton Storyblok absent : la variable STORYBLOK_PREVIEW_TOKEN n'est pas définie."
    );
  }
  return token;
}

/**
 * Récupère une story Storyblok côté serveur.
 *
 * - "published" : réponse mise en cache sous STORYBLOK_CACHE_TAG jusqu'à
 *   son invalidation par le webhook.
 * - "draft" : jamais mise en cache (aperçu dans l'éditeur).
 *
 * Retourne `null` si la story n'existe pas (404). Lève StoryblokFetchError
 * dans tous les autres cas d'échec ; le message ne contient jamais le jeton.
 */
export async function fetchStory(
  slug: string,
  version: StoryVersion
): Promise<ISbStoryData | null> {
  const token = getStoryblokToken();

  const params = new URLSearchParams({ version, token });

  let res: Response;
  try {
    res = await fetch(
      `${STORIES_ENDPOINT}/${slug}?${params}`,
      version === "draft"
        ? { cache: "no-store" }
        : { cache: "force-cache", next: { tags: [STORYBLOK_CACHE_TAG] } }
    );
  } catch (cause) {
    throw new StoryblokFetchError(`Storyblok injoignable (story « ${slug} »).`, { cause });
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new StoryblokFetchError(
      `Storyblok a répondu ${res.status} pour la story « ${slug} » (${version}).`,
      { status: res.status }
    );
  }

  let data: { story?: ISbStoryData };
  try {
    data = await res.json();
  } catch (cause) {
    throw new StoryblokFetchError(`Réponse Storyblok illisible (story « ${slug} »).`, { cause });
  }
  if (!data.story?.content) {
    throw new StoryblokFetchError(`Réponse Storyblok sans contenu (story « ${slug} »).`);
  }
  return data.story;
}
