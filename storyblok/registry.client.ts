"use client";
// Registre des blocs Storyblok pour le rendu CLIENT (aperçu en direct dans
// l'éditeur visuel). Ne contient que des composants exécutables dans le
// navigateur : hero_full_bleed et media_item sont des composants serveur
// asynchrones (Edge Config) et n'y figurent donc pas.
import { storyblokInit } from "@storyblok/react";
import EditorialStrip from "./EditorialStrip";
import GridMasonry from "./GridMasonry";
import HomeClient from "./HomeClient";
import SplitDiptych from "./SplitDiptych";
import VideoFull from "./VideoFull";

storyblokInit({
  // Le pont est chargé explicitement par le composant d'aperçu.
  bridge: false,
  // Affiche un message lisible dans l'éditeur pour un bloc absent du registre.
  enableFallbackComponent: true,
  components: {
    home: HomeClient,
    page: HomeClient,
    grid_masonry: GridMasonry,
    split_diptych: SplitDiptych,
    video_full: VideoFull,
    editorial_strip: EditorialStrip,
  },
});
