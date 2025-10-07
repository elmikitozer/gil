"use client";

import { useStoryblokBridge, ISbStoryData } from "@storyblok/react";

interface Props {
  storyId?: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeClient({ storyId, mutate }: Props) {
  // Ce hook est toujours appelé, mais il ne fera rien côté serveur
  useStoryblokBridge(storyId || 0, (story) => {
    if (mutate) mutate(story);
  });

  return null;
}
