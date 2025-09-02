import ZoomableImage from "@/app/components/ZoomableImage";
import { storyblokEditable } from "@storyblok/react/rsc";
import { getAssetBump, versionUrl } from "@/lib/asset-version";

export default async function MediaItem({ blok }: any) {
  const file = blok?.media?.filename;
  const alt = blok?.alt || "";
  if (!file) return null;

  const bump = await getAssetBump();

  return (
    <figure {...storyblokEditable(blok)} className="w-full">
      <ZoomableImage src={versionUrl(file, bump)} alt={alt} />
      {blok?.caption && (
        <figcaption className="mt-2 text-sm text-[--color-muted]">
          {blok.caption}
        </figcaption>
      )}
    </figure>
  );
}
