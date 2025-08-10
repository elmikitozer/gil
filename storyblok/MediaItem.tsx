import ZoomableImage from "@/app/components/ZoomableImage";
import { storyblokEditable } from "@storyblok/react/rsc";
import Image from "next/image";

export default function MediaItem({ blok }: any) {
  const file = blok?.media?.filename;
  const alt = blok?.alt || "";
  if (!file) return null;
  return (
    <figure {...storyblokEditable(blok)} className="w-full">
      <ZoomableImage src={file} alt={alt} />
      {blok?.caption && (
        <figcaption className="mt-2 text-sm text-[--color-muted]">
          {blok.caption}
        </figcaption>
      )}
    </figure>
  );
}
