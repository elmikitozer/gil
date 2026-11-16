'use client';

import { useEffect, useRef } from 'react';

type Props = {
  srcMp4: string;
  srcWebm?: string;
  /** Image affichée avant le démarrage de la vidéo (et seule, si l'animation est réduite). */
  poster: string;
  className?: string;
};

/**
 * Vidéo décorative en boucle, muette. Rien n'est téléchargé avant que la vidéo
 * apparaisse à l'écran (`preload="none"`, lecture déclenchée à l'affichage) :
 * `autoPlay` aurait lancé le téléchargement de plusieurs Mo dès le chargement de la page.
 * Avec « réduire les animations » activé, seule l'affiche est affichée.
 */
export default function LoopVideo({ srcMp4, srcWebm, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.muted = true; // requis pour la lecture automatique
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      className={className}
    >
      {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
      <source src={srcMp4} type="video/mp4" />
    </video>
  );
}
