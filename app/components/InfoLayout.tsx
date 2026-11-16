import LoopVideo from './LoopVideo';

/**
 * Mise en page des pages d'information (/information, /mentions-legales) :
 * vidéo à gauche, contenu à droite (empilés sur mobile).
 */
export default function InfoLayout({
  lang,
  children,
}: {
  /** Langue du contenu, si elle diffère de celle du site. */
  lang?: string;
  children: React.ReactNode;
}) {
  return (
    <section lang={lang} className="mx-auto max-w-6xl px-4 py-[clamp(32px,10vh,96px)]">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center md:justify-center md:min-h-[70vh]">
        {/* Vidéo à gauche : carrée (960 × 960, H.264 sans audio), sa place est réservée avant le chargement */}
        <div className="w-full mt-8 md:w-[45%] md:max-w-md mb-8 md:mb-0">
          <LoopVideo
            srcMp4="/videos/info-video.mp4"
            poster="/videos/info-video-poster.jpg"
            className="w-full h-auto aspect-square"
          />
        </div>

        {/* Contenu à droite */}
        <div className="mt-auto mb-auto w-full md:w-[45%] md:max-w-md">{children}</div>
      </div>
    </section>
  );
}
