"use client";

import { storyblokInit, apiPlugin } from "@storyblok/react";
import HeroFullBleed from "@/storyblok/HeroFullBleed";
import GridMasonry from "@/storyblok/GridMasonry";
import MediaItem from "@/storyblok/MediaItem";
import SplitDiptych from "@/storyblok/SplitDiptych";
import VideoFull from "@/storyblok/VideoFull";
import EditorialStrip from "@/storyblok/EditorialStrip";
import Home from "@/storyblok/Home";

let initialized = false;

export default function StoryblokClientInit() {
	if (!initialized) {
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
		initialized = true;
	}

	return null;
}
