'use client';

import type { Item } from './ui/gallery/types';
import useIsStoryblokEditor from './useIsStoryblokEditor';
import { uploadedVideoInfo } from '@/lib/videos';

// Garde-fou visible uniquement dans l'éditeur visuel Storyblok : signale une
// vidéo dont l'adresse ne vient pas de la page d'envoi (/admin/videos), donc
// ni contrôlée (poids, format) ni hébergée sur R2. Rien sur le site public.

function videoSources(item: Item): string[] {
  if (item.kind === 'video' || item.kind === 'hybrid') return [item.srcMp4];
  if (item.kind === 'image' && item.albumPhotos) {
    return item.albumPhotos.flatMap((p) => (p.kind === 'video' || p.kind === 'hybrid' ? [p.srcMp4] : []));
  }
  return [];
}

export default function EditorVideoWarning({ item }: { item: Item }) {
  const isEditor = useIsStoryblokEditor();
  if (!isEditor) return null;
  const bad = videoSources(item).filter((src) => !uploadedVideoInfo(src));
  if (bad.length === 0) return null;
  const inAlbum = item.kind === 'image';
  return (
    <p
      role="note"
      title={bad.join('\n')}
      className="pointer-events-none absolute inset-x-2 top-2 z-30 rounded bg-amber-300 px-2 py-1 text-xs leading-snug text-black shadow"
    >
      {inAlbum
        ? `${bad.length} vidéo(s) de l’album à renvoyer par la page d’envoi (/admin/videos).`
        : 'Vidéo à renvoyer par la page d’envoi (/admin/videos) : elle n’est ni contrôlée ni sur le bon hébergement.'}
    </p>
  );
}
