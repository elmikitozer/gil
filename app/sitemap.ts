import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { fetchStory } from '@/lib/storyblok';

// Pages à indexer. /mentions-legales est en « noindex » et la route d'aperçu
// de l'éditeur Storyblok n'est pas publique : elles n'y figurent pas.
//
// lastModified : uniquement la date de publication réelle de la story « home »
// (même lecture mise en cache que la page d'accueil). En cas d'échec ou de date
// absente, l'entrée est émise sans lastModified : le sitemap ne fait jamais
// échouer le build. /information n'a aucune source de date fiable : pas de date.
async function homeLastModified(): Promise<Date | undefined> {
  try {
    const story = await fetchStory('home', 'published');
    if (!story?.published_at) return undefined;
    const date = new Date(story.published_at);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await homeLastModified();
  return [
    lastModified ? { url: `${SITE_URL}/`, lastModified } : { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/information` },
  ];
}
