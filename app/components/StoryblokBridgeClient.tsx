"use client";

import dynamic from "next/dynamic";
import type { ISbStoryData } from "@storyblok/react";

// on importe le vrai bridge dynamiquement, jamais côté serveur
const BridgeInner = dynamic(
  () => import("./StoryblokBridgeInner"),
  { ssr: false } // ⬅️ clé de la solution
);

interface Props {
  storyId?: number;
  mutate?: (story: ISbStoryData) => void;
}

export default function StoryblokBridgeClient({ storyId, mutate }: Props) {
  return <BridgeInner storyId={storyId} mutate={mutate} />;
}
