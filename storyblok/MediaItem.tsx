import ZoomableImage from '@/app/components/ZoomableImage';
import { storyblokEditable } from '@storyblok/react/rsc';
import { getAssetBump, versionUrl } from '@/lib/asset-version';
import type { Item } from '@/app/components/ui/gallery/GalleryContext';

export default async function MediaItem({ blok }: any) {
  const file = blok?.media?.filename;
  const alt = blok?.alt || '';
  if (!file) return null;

  const bump = await getAssetBump();

  // Traitement des photos/vidéos d'album depuis Storyblok
  let albumPhotos: Item[] | undefined;
  if (blok?.album_photos && Array.isArray(blok.album_photos)) {
    albumPhotos = blok.album_photos
      .filter((photo: any) => photo?.filename || photo?.cloudinary_url || photo?.vimeo_id)
      .map((photo: any) => {
        // HYBRID : Vidéo avec Cloudinary preview + Vimeo fullscreen
        if (photo.cloudinary_url && photo.vimeo_id) {
          return {
            kind: 'hybrid' as const,
            srcMp4: photo.cloudinary_url,
            vimeoId: photo.vimeo_id,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }
        
        // VIMEO uniquement
        if (photo.vimeo_id && !photo.cloudinary_url) {
          return {
            kind: 'vimeo' as const,
            vimeoId: photo.vimeo_id,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }
        
        // VIDEO Cloudinary uniquement
        if (photo.cloudinary_url && !photo.vimeo_id) {
          return {
            kind: 'video' as const,
            srcMp4: photo.cloudinary_url,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }
        
        // Video depuis assets Storyblok
        if (photo.filename) {
          const filename = photo.filename;
          const isVideo = filename.endsWith('.mp4') || filename.endsWith('.webm') || filename.endsWith('.mov');

          if (isVideo) {
            return {
              kind: 'video' as const,
              srcMp4: versionUrl(filename, bump),
              poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
              alt: photo.alt || '',
              title: photo.title || '',
            };
          } else {
            // C'est une image
            return {
              kind: 'image' as const,
              src: versionUrl(filename, bump),
              alt: photo.alt || '',
              title: photo.title || '',
              caption: photo.caption || '',
            };
          }
        }
        
        return null;
      })
      .filter((item): item is Item => item !== null);
  }

  const isCoverPhoto = blok?.is_cover_photo === true;

  return (
    <figure {...storyblokEditable(blok)} className="w-full">
      <ZoomableImage
        src={versionUrl(file, bump)}
        alt={alt}
        hoverTitle={blok?.title}
        hoverCaption={blok?.caption}
        onOpen={() => {
          // Cette fonction sera appelée par ZoomableImage mais ne sera pas utilisée
          // car MasonryColumns gère l'ouverture de l'album
        }}
      />
      {blok?.caption && (
        <figcaption className="mt-2 text-sm text-[--color-muted]">{blok.caption}</figcaption>
      )}
    </figure>
  );
}
