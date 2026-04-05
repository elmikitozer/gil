"use client";

import { useEffect } from "react";
import { useStoryblokBridge, type ISbStoryData } from "@storyblok/react";

interface Props {
  storyId?: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeInner({ storyId, mutate }: Props) {
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      // on vérifie côté client
      if (typeof window === "undefined") return;

      const sb = (window as unknown as { storyblok?: unknown }).storyblok;
      const parentSb = (window.parent as unknown as { storyblok?: unknown })
        ?.storyblok;

      if (sb || parentSb) {
        clearInterval(timer);
      } else {
        tries++;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hook toujours appelé (jamais conditionnel)
  useStoryblokBridge(storyId ?? 0, (story) => {
    mutate?.(story);
  });
  return null;
}
