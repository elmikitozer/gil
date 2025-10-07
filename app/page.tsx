import { getStoryblokApi, StoryblokServerComponent } from "@storyblok/react/rsc";
import { ensureStoryblok } from "@/lib/storyblok";
import StoryblokBridgeClient from "./components/StoryblokBridgeClient";

export const dynamic = "force-dynamic"; // ⬅️ ajoute ceci tout en haut
export const revalidate = 0;

export default async function Home() {
  ensureStoryblok();
  const api = getStoryblokApi();

  const version: "published" | "draft" =
    process.env.NODE_ENV === "production" ? "published" : "draft";

  const { data } = await api.get("cdn/stories/home", { version });
  const story = data?.story;

  return (
    <>
      <StoryblokServerComponent blok={story.content} />
      <StoryblokBridgeClient storyId={story.id} />
    </>
  );
}

