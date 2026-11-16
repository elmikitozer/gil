import { storyblokEditable } from "@storyblok/react/rsc";
import type { SbBlokData } from "@storyblok/react/rsc";
import Image from "next/image";

type HeroFullBleedBlok = SbBlokData & {
  media?: { filename?: string; alt?: string };
  title?: string;
};

export default function HeroFullBleed({ blok }: { blok: HeroFullBleedBlok }) {
  const media = blok.media?.filename;
  const title = blok.title;

  return (
    <section {...storyblokEditable(blok)} className="relative w-full min-h-[70vh] md:min-h-screen ">
      {media && (
        <Image
          src={media}
          alt={blok.media?.alt ?? ""}
          fill
          className="object-cover"
          priority
        />
      )}
      {title && (
        <div className="absolute inset-0 flex items-end p-6 md:p-10">
          <h1 className="text-4xl md:text-6xl font-serif text-fg">
            {title}
          </h1>
        </div>
      )}
    </section>
  );
}
