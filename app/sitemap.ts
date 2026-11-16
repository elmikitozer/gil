import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Pages à indexer. /mentions-legales est en « noindex » et la route d'aperçu
// de l'éditeur Storyblok n'est pas publique : elles n'y figurent pas.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }, { url: `${SITE_URL}/information` }];
}
