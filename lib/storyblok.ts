import type { ISbStoryData } from "@storyblok/react/rsc";

const STORIES_ENDPOINT = "https://api.storyblok.com/v2/cdn/stories";

export type StoryVersion = "published" | "draft";

/**
 * Récupère une story Storyblok côté serveur.
 *
 * - "published" : appelée pendant le prérendu de la page ; le résultat vit
 *   dans le cache de la page jusqu'à la revalidation par le webhook.
 * - "draft" : jamais mise en cache (aperçu dans l'éditeur).
 */
export async function fetchStory(slug: string, version: StoryVersion): Promise<ISbStoryData> {
  const params = new URLSearchParams({
    version,
    token: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN ?? "",
    // "cv" récent : force Storyblok à servir la dernière version publiée.
    cv: String(Date.now()),
  });

  const res = await fetch(
    `${STORIES_ENDPOINT}/${slug}?${params}`,
    version === "draft" ? { cache: "no-store" } : undefined
  );
  const data: { story: ISbStoryData } = await res.json();
  return data.story;
}
