'use client';

import { useEffect, useState } from 'react';
import {
  StoryblokComponent,
  isBridgeLoaded,
  loadStoryblokBridge,
  registerStoryblokBridge,
} from '@storyblok/react';
import type { ISbStoryData } from '@storyblok/react';
import '@/storyblok/registry.client';

/**
 * Rendu client d'une story avec mise à jour en direct dans l'éditeur visuel.
 * Le script du pont Storyblok n'est chargé qu'ici, donc uniquement dans
 * l'éditeur : les visiteurs du site public ne le téléchargent plus.
 */
export default function StoryblokPreview({ story }: { story: ISbStoryData }) {
  const [liveStory, setLiveStory] = useState(story);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!isBridgeLoaded()) await loadStoryblokBridge();
      } catch (error) {
        console.error('Chargement du pont Storyblok impossible :', error);
        return;
      }
      if (cancelled) return;
      // "input" : mise à jour en direct ; "change"/"published" : rechargement
      // de la page (géré par le SDK).
      registerStoryblokBridge(story.id, (updated) => setLiveStory(updated));
    })();

    return () => {
      cancelled = true;
    };
  }, [story.id]);

  return <StoryblokComponent blok={liveStory.content} />;
}
