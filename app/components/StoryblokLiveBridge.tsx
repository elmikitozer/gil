"use client";

import { useEffect } from "react";
import type { ISbStoryData } from "@storyblok/react";

/**
 * Bridge universel compatible Storyblok V2 + Next 15
 * sans accès direct au parent (cross-origin safe)
 */
export default function StoryblokLiveBridge({
  storyId,
  mutate,
}: {
  storyId: number;
  mutate?: (story: ISbStoryData) => void;
}) {
  useEffect(() => {
    const isPreview =
      typeof window !== "undefined" &&
      (location.search.includes("_storyblok") ||
        location.search.includes("_storyblok_version"));
    if (!isPreview) return;

    console.log("⏳ Attente des messages Storyblok V2…");

    const handleMessage = (event: MessageEvent) => {
      // 1️⃣ On ne garde que les messages venant du domaine Storyblok
      if (
        !event.origin.includes("storyblok.com") ||
        typeof event.data !== "object"
      )
        return;

      // 2️⃣ Analyse du type d’évènement reçu
      const { action, story } = event.data || {};

      if (action === "input" && story?.id === storyId) {
        console.log("🔁 input depuis Storyblok V2:", story);
        mutate?.(story);
      }

      if (["change", "published"].includes(action)) {
        console.log("♻️ reload demandé par Storyblok V2");
        location.reload();
      }

      if (action === "enterEditmode") {
        console.log("✍️ Mode édition actif (Storyblok V2)");
      }
    };

    window.addEventListener("message", handleMessage);
    console.log("✅ Bridge Storyblok V2 connecté (écoute postMessage)");

    return () => window.removeEventListener("message", handleMessage);
  }, [storyId, mutate]);

  return null;
}
