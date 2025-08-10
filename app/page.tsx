import { getStoryblokApi, StoryblokServerComponent } from "@storyblok/react/rsc";
import { ensureStoryblok } from "@/lib/storyblok";
import { KNOWN } from "@/lib/storyblok";
import Unknown from "@/lib/unkown";
// import HeroLogo from "./components/HeroLogo";



export default async function Home() {
  ensureStoryblok();
  const api = getStoryblokApi();
  
  const version = process.env.NODE_ENV === "production" ? "published" : "draft";
  const { data } = await api.get("cdn/stories/home", { version });
  return (
    <>
      <StoryblokServerComponent blok={data?.story?.content} />
    </>
  );
}
