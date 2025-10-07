"use client";

import { useEffect } from "react";
import { useStoryblokBridge, ISbStoryData } from "@storyblok/react";

interface Props {
  storyId?: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeInner({ storyId, mutate }: Props) {
  // Attendre que le bridge apparaisse dans window ou window.parent
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      const sb =
        (window as any)?.storyblok || (window.parent as any)?.storyblok;
      if (sb) {
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

  // Reste inchangé
  useStoryblokBridge(storyId ?? 0, (story) => {
    console.log("🔁 Storyblok Bridge TRIGGERED:", story);
    if (mutate) mutate(story);
  });

  console.log("✅ StoryblokBridgeInner monté — storyId:", storyId);
  return null;
}
