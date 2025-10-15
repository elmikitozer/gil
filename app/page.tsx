import { getStoryblokApi } from '@storyblok/react/rsc';
import { ensureStoryblok } from '@/lib/storyblok';
import ClientStoryRenderer from './components/ClientStoryRenderer';

export const dynamic = 'force-dynamic'; // ⬅️ ajoute ceci tout en haut
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  ensureStoryblok();
  const api = getStoryblokApi();

  // In Visual Editor, Storyblok app adds _storyblok query param; always use draft when present
  const sp = await searchParams;
  const isEditor =
    typeof sp._storyblok !== 'undefined' || typeof sp._storyblok_version !== 'undefined';
  const version: 'published' | 'draft' =
    isEditor || process.env.NODE_ENV !== 'production' ? 'draft' : 'published';

  const { data } = await api.get('cdn/stories/home', { version });
  const story = data?.story;

  return <ClientStoryRenderer story={story} />;
}
