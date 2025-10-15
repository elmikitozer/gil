'use client';

import { useEffect, useState } from 'react';
import type { ISbStoryData } from '@storyblok/react';
import { StoryblokComponent, useStoryblokBridge } from '@storyblok/react';

type Props = {
  story: ISbStoryData | undefined;
};

export default function StoryRenderer({ story }: Props) {
  const [liveStory, setLiveStory] = useState<ISbStoryData | undefined>(story);

  // Subscribe to the Visual Editor bridge when storyId is known
  const storyId = liveStory?.id ?? story?.id;
  useStoryblokBridge(storyId ?? 0, (s) => setLiveStory(s));

  // Handle global editor events: change/published triggers reload in Visual Editor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sb = (window as Window & typeof globalThis).storyblok;
    if (!sb) return;
    const onChange = () => location.reload();
    const onEnter = () => console.log('✍️ Storyblok editmode active');
    sb.on?.(['change', 'published'], onChange);
    sb.on?.('enterEditmode', onEnter);
    return () => {
      try {
        sb.off?.(['change', 'published'], onChange);
        sb.off?.('enterEditmode', onEnter);
      } catch {}
    };
  }, [storyId]);

  if (!liveStory?.content) return null;
  return <StoryblokComponent blok={liveStory.content} />;
}
