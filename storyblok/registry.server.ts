// Registre des blocs Storyblok pour le rendu SERVEUR (pages publiques).
// À importer uniquement depuis des Server Components.
import { setComponents } from "@storyblok/react/rsc";
import EditorialStrip from "./EditorialStrip";
import GridMasonry from "./GridMasonry";
import HeroFullBleed from "./HeroFullBleed";
import Home from "./Home";
import MediaItem from "./MediaItem";
import SplitDiptych from "./SplitDiptych";
import VideoFull from "./VideoFull";

setComponents({
  home: Home,
  page: Home,
  hero_full_bleed: HeroFullBleed,
  grid_masonry: GridMasonry,
  media_item: MediaItem,
  split_diptych: SplitDiptych,
  video_full: VideoFull,
  editorial_strip: EditorialStrip,
});
