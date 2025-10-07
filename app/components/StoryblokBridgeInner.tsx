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
        console.log("✅ Bridge Storyblok détecté après", tries, "tentatives");
        clearInterval(timer);
      } else {
        tries++;
        if (tries % 3 === 0) {
          console.log("⏳ En attente du bridge Storyblok...");
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hook toujours appelé (jamais conditionnel)
  useStoryblokBridge(storyId ?? 0, (story) => {
    console.log("🔁 Storyblok Bridge TRIGGERED:", story);
    mutate?.(story);
  });

  console.log("✅ StoryblokBridgeInner monté — storyId:", storyId);
  return null;
}
