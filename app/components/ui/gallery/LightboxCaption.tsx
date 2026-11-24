import type { ReactNode } from 'react';

type LightboxCaptionProps = {
  /** Titre de l'élément (vide : la barre reste en place, sans texte). */
  title?: string;
  /** Rang de l'élément dans la liste ouverte (à partir de 1) et taille de la liste. */
  current: number;
  total: number;
  /** Compteur « fig. n sur N » : seulement quand la liste compte plusieurs éléments. */
  showCounter: boolean;
  /** Le média : photo, vidéo ou lecteur Vimeo. */
  children: ReactNode;
};

/**
 * Cadre commun de toutes les diapositives de la visionneuse : le média au centre,
 * la légende dans une barre.
 * - ordinateur : barre du bas, titre en italique à gauche, compteur au centre ;
 * - mobile : barre du haut, titre à gauche, compteur à droite.
 * Photos, vidéos MP4 et Vimeo l'utilisent toutes, pour que la légende soit
 * au même endroit et dans le même style quel que soit le média.
 */
export default function LightboxCaption({
  title,
  current,
  total,
  showCounter,
  children,
}: LightboxCaptionProps) {
  return (
    <div className="flex flex-col w-full h-full px-4 pt-4 pb-4 md:pt-10 md:pb-10">
      {/* Mobile: Top bar with title left, counter right */}
      <div className="md:hidden h-[8%] flex items-start justify-between pointer-events-none">
        <div className="text-base italic text-black">{title || ''}</div>
        {showCounter && (
          <div lang="fr" className="text-base italic text-black">
            fig. {current} sur {total}
          </div>
        )}
      </div>
      {/* Média */}
      <div className="h-[92%] md:h-[90%] flex items-center justify-center">{children}</div>
      {/* Desktop: Bottom bar with title left, counter center */}
      <div className="hidden md:flex h-[10%] items-center justify-center">
        <div className="w-full flex items-center pointer-events-none">
          <div className="flex-1 text-xl italic text-black">{title || ''}</div>
          {showCounter && (
            <div
              lang="fr"
              className="absolute left-1/2 -translate-x-1/2 text-xl italic text-black"
            >
              fig. {current} sur {total}
            </div>
          )}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
