import { storyblokEditable } from "@storyblok/react/rsc";

export default function VideoFull({ blok }: any) {
  const type = blok?.source_type || "mp4";
  const poster = blok?.poster?.filename;
  return (
    <section {...storyblokEditable(blok)} className="mt-10">
      {type === "vimeo" ? (
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${blok?.vimeo_id}?autoplay=${blok?.autoplay_muted ? 1 : 0}&muted=${blok?.autoplay_muted ? 1 : 0}&loop=${blok?.loop ? 1 : 0}&controls=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      ) : (
        <video
          className="w-full h-auto"
          autoPlay={!!blok?.autoplay_muted}
          muted={!!blok?.autoplay_muted}
          loop={!!blok?.loop}
          playsInline
          poster={poster || undefined}
          controls={!blok?.autoplay_muted}
        >
          <source src={blok?.video_file?.filename} type="video/mp4" />
        </video>
      )}
    </section>
  );
}
