import StoryblokBridgeClient from "./components/StoryblokBridgeClient";
import { getStoryblokApi, StoryblokServerComponent } from "@storyblok/react/rsc";
import { ensureStoryblok } from "@/lib/storyblok";
// import { KNOWN } from "@/lib/storyblok";
// import Unknown from "@/lib/unkown";
// import HeroLogo from "./components/HeroLogo";



export default async function Home() {
  ensureStoryblok();
  const api = getStoryblokApi();

  const version: "published" | "draft" =
  process.env.NODE_ENV === "production" ? "published" : "draft";


  const { data } = await api.get("cdn/stories/", { version });
  return (
    <>
      <StoryblokServerComponent blok={data?.story?.content} />
      <StoryblokBridgeClient />
    </>
  );
}
export const revalidate = 60; // ou 0 si tu veux tout dynamique (moins perf)
