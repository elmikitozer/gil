"use client";

import { useStoryblokBridge, ISbStoryData } from "@storyblok/react";

interface Props {
  storyId?: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeInner({ storyId, mutate }: Props) {
  // Ce composant n’est jamais rendu côté serveur → window toujours défini
  useStoryblokBridge(storyId ?? 0, (story) => {
    console.log("🔁 Storyblok Bridge TRIGGERED:", story);
    if (mutate) mutate(story);
  });

  console.log("✅ StoryblokBridgeInner monté — storyId:", storyId);
  return null;
}

