import { storyblokInit, apiPlugin } from "@storyblok/react/rsc";
import HeroFullBleed from "@/storyblok/HeroFullBleed";
import GridMasonry from "@/storyblok/GridMasonry";
import MediaItem from "@/storyblok/MediaItem";
import SplitDiptych from "@/storyblok/SplitDiptych";
import VideoFull from "@/storyblok/VideoFull";
import EditorialStrip from "@/storyblok/EditorialStrip";
import Home from "@/storyblok/Home";

let inited = false;

export function ensureStoryblok() {
  if (inited) return;
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    components: {
      home: Home,
      page: Home,
      hero_full_bleed: HeroFullBleed,
      grid_masonry: GridMasonry,
      media_item: MediaItem,
      split_diptych: SplitDiptych,
      video_full: VideoFull,
      editorial_strip: EditorialStrip,
    },
  });
  inited = true;
}

// lib/storyblok.ts (exporte les noms connus)
export const KNOWN = new Set([
  "grid_masonry",
  "editorial_strip",
  "media_item",
  "video_item",
  "hero_full_bleed",
  // ...
]);
