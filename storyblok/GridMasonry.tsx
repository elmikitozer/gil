// /storyblok/GridMasonry.tsx
import { storyblokEditable } from "@storyblok/react/rsc";
import MasonryColumns from "@/app/components/MasonryColumns";

export default function GridMasonry({ blok }: any) {
  const items = (blok?.items || []).flatMap((c: any) => {
    if (c?.component === "media_item" && c?.media?.filename) {
      return [
        {
          kind: "image",
          src: c.media.filename as string,
          alt: c.alt as string | undefined,
          title: c.title as string | undefined,
          caption: c.caption as string | undefined, // ⬅️ NEW
        },
      ];
    }
    if (c?.component === "video_item" && c?.srcMp4) {
      return [
        {
          kind: "video",
          srcMp4: c.srcMp4 as string,
          srcWebm: c.srcWebm as string | undefined,
          poster: c.poster?.filename as string | undefined,
          alt: c.alt as string | undefined,
          ratio: c.ratio as string | undefined,
          title: c.title as string | undefined, // ⬅️ NEW
          caption: c.caption as string | undefined, // ⬅️ NEW
        },
      ];
    }
    return [];
  });

  return (
    <section
      {...storyblokEditable(blok)}
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-[8px] md:px-[12px]"
    >
      <MasonryColumns items={items} gap={10} />
    </section>
  );
}
