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

  // Fusionner album_photos (Multi-Assets) et album_videos (Blocks video_item)
  const allMedia: any[] = [];

  // Ajouter les photos du Multi-Assets
  if (blok?.album_photos && Array.isArray(blok.album_photos)) {
    console.log('📸 album_photos:', blok.album_photos.length, 'items');
    allMedia.push(...blok.album_photos);
  }

  // Ajouter les vidéos du champ album_videos (blocs video_item)
  if (blok?.album_videos && Array.isArray(blok.album_videos)) {
    console.log('🎬 album_videos:', blok.album_videos.length, 'items');
    console.log('🎬 Premier item:', blok.album_videos[0]);
    allMedia.push(...blok.album_videos);
  }

  console.log('📦 Total allMedia:', allMedia.length, 'items');

  if (allMedia.length > 0) {
    const mapped = allMedia
      .filter((photo: any) => photo?.filename || photo?.cloudinary_url || photo?.vimeo_id || photo?.srcMp4 || photo?.vimeoId)
      .map((photo: any): Item | null => {
        // Bloc video_item avec srcMp4 et vimeoId (HYBRID)
        if (photo.component === 'video_item' && photo.srcMp4 && photo.vimeoId) {
          return {
            kind: 'hybrid' as const,
            srcMp4: photo.srcMp4,
            vimeoId: photo.vimeoId,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }

        // Bloc video_item avec vimeoId uniquement
        if (photo.component === 'video_item' && photo.vimeoId && !photo.srcMp4) {
          return {
            kind: 'vimeo' as const,
            vimeoId: photo.vimeoId,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }

        // Bloc video_item avec srcMp4 uniquement
        if (photo.component === 'video_item' && photo.srcMp4 && !photo.vimeoId) {
          return {
            kind: 'video' as const,
            srcMp4: photo.srcMp4,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }

        // HYBRID : Vidéo avec Cloudinary preview + Vimeo fullscreen (champs directs)
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

        // VIMEO uniquement (champs directs)
        if (photo.vimeo_id && !photo.cloudinary_url) {
          return {
            kind: 'vimeo' as const,
            vimeoId: photo.vimeo_id,
            poster: photo.poster?.filename ? versionUrl(photo.poster.filename, bump) : undefined,
            alt: photo.alt || '',
            title: photo.title || '',
          };
        }

        // VIDEO Cloudinary uniquement (champs directs)
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
      });

    // Filtrer les null et typer correctement
    albumPhotos = mapped.filter((item): item is Item => item !== null);
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
