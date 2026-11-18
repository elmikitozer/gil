import { notFound } from 'next/navigation';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { fetchStory } from '@/lib/storyblok';
import '@/storyblok/registry.server';

// Le canonical n'est plus dans le layout racine : il est déclaré ici (valeur inchangée).
export const metadata = {
  alternates: { canonical: 'https://gilanselmi.com' },
};

// Page statique : prérendue au build, puis régénérée quand le webhook
// Storyblok invalide l'étiquette de cache (app/api/revalidate).
//
// Gestion d'erreur : si Storyblok échoue pendant une régénération,
// fetchStory lève une erreur et Next continue de servir la dernière version
// réussie de la page, puis réessaie aux visites suivantes (vérifié en local
// avec une panne simulée). Au build, la même erreur fait échouer le
// déploiement plutôt que de publier une home vide.
export default async function HomePage() {
  const story = await fetchStory('home', 'published');
  if (!story) notFound();

  return <StoryblokServerComponent blok={story.content} />;
}
