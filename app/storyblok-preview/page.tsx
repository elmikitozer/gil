import type { Metadata } from 'next';
import StoryblokPreview from '@/app/components/StoryblokPreview';
import { fetchStory } from '@/lib/storyblok';

// Aperçu du brouillon pour l'éditeur visuel Storyblok. Les requêtes
// « /?_storyblok=… » y sont réécrites par next.config.ts : la home publique
// reste statique et seul l'éditeur déclenche ce rendu dynamique.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StoryblokPreviewPage() {
  const story = await fetchStory('home', 'draft');

  return <StoryblokPreview story={story} />;
}
