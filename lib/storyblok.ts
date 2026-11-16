import { storyblokInit, apiPlugin } from "@storyblok/react/rsc";
import "@/storyblok/registry.server";

let inited = false;

export function ensureStoryblok() {
  if (inited) return;
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
  });
  inited = true;
}
