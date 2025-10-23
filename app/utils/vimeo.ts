/**
 * Extrait l'ID Vimeo depuis une URL ou retourne l'ID tel quel
 *
 * Supporte :
 * - ID simple: "982501226"
 * - URL complète: "https://vimeo.com/982501226"
 * - URL avec /video/: "https://vimeo.com/video/982501226"
 * - URL player: "https://player.vimeo.com/video/982501226"
 */
export function extractVimeoId(input: string | undefined): string | null {
  if (!input) return null;

  // Si c'est déjà juste un nombre, retourner tel quel
  if (/^\d+$/.test(input)) {
    return input;
  }

  // Extraire l'ID depuis une URL
  const patterns = [
    /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456789
    /vimeo\.com\/video\/(\d+)/,    // https://vimeo.com/video/123456789
    /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456789
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Si aucun pattern ne match, retourner null
  console.warn('Format Vimeo invalide:', input);
  return null;
}

