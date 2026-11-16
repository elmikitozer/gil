import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { fetchStory } from '@/lib/storyblok';
import '@/storyblok/registry.server';

// Page statique : prérendue au build, puis régénérée uniquement quand le
// webhook Storyblok appelle revalidatePath('/') (app/api/revalidate).
export default async function HomePage() {
  const story = await fetchStory('home', 'published');

  return <StoryblokServerComponent blok={story.content} />;
}
