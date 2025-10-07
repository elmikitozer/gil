"use client";

import { useStoryblokBridge, ISbStoryData } from "@storyblok/react";

interface Props {
  storyId: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeClient({ storyId, mutate }: Props) {
  useStoryblokBridge(storyId, (story) => {
    if (mutate) mutate(story);
  });

  return null;
}
