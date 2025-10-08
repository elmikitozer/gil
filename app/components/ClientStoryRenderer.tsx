"use client";

import dynamic from "next/dynamic";
import type { ISbStoryData } from "@storyblok/react";

const Inner = dynamic(() => import("./StoryRenderer"), { ssr: false });

export default function ClientStoryRenderer({ story }: { story: ISbStoryData | undefined }) {
  return <Inner story={story} />;
}
