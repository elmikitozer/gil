export {};

declare global {
  interface Window {
    storyblok?: {
      init: () => void;
      // tu peux ajouter d’autres méthodes si tu veux du typage plus précis
      // e.g. pingEditor?: () => void;
    };
  }
}
