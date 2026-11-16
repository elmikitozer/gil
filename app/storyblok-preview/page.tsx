import type { Metadata } from 'next';
import StoryblokPreview from '@/app/components/StoryblokPreview';
import { fetchStory } from '@/lib/storyblok';
import type { ISbStoryData } from '@storyblok/react/rsc';

// Aperçu du brouillon pour l'éditeur visuel Storyblok. Les requêtes
// « /?_storyblok=… » y sont réécrites par next.config.ts : la home publique
// reste statique et seul l'éditeur déclenche ce rendu dynamique.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StoryblokPreviewPage() {
  let story: ISbStoryData | null;
  try {
    story = await fetchStory('home', 'draft');
  } catch (error) {
    console.error(error);
    return <PreviewMessage>Le brouillon n’a pas pu être chargé depuis Storyblok.</PreviewMessage>;
  }
  if (!story) {
    return <PreviewMessage>La story « home » est introuvable dans Storyblok.</PreviewMessage>;
  }

  return <StoryblokPreview story={story} />;
}

function PreviewMessage({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 pt-16 text-center">
      <p role="alert">{children}</p>
    </section>
  );
}
