// import { storyblokEditable } from "@storyblok/react/rsc";
// import Image from "next/image";

// export default function HeroFullBleed({ blok }: any) {
//   const media = blok?.media?.filename;
//   const title = blok?.title;
//   return (
//     <section {...storyblokEditable(blok)} className="relative w-full min-h-[70vh] md:min-h-screen">
//       {media && (
//         <Image
//           src={media}
//           alt={title || "Hero"}
//           fill
//           className="object-cover"
//           priority
//           sizes="100vw"
//         />
import { storyblokEditable } from "@storyblok/react/rsc";
import Image from "next/image";
import { getAssetBump, versionUrl } from "@/lib/asset-version";

export default async function HeroFullBleed({ blok }: any) {
  const media = blok?.media?.filename;
  const title = blok?.title;
  const bump = await getAssetBump();

  return (
    <section {...storyblokEditable(blok)} className="relative w-full min-h-[70vh] md:min-h-screen">
      {media && (
        <Image
          src={versionUrl(media, bump)}
          alt={title || "Hero"}
          fill
          className="object-cover"
          priority
        />
      )}
      {title && (
        <div className="absolute inset-0 flex items-end p-6 md:p-10">
          <h1 className="text-4xl md:text-6xl font-serif bg-[rgba(0,0,0,0.0)] text-[--color-fg]">
            {title}
          </h1>
        </div>
      )}
    </section>
  );
}
