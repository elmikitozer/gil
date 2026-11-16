import "server-only";
import { createHash, timingSafeEqual } from "crypto";
import { getStoryblokToken } from "./storyblok";

/** Durée de validité d'une signature d'aperçu (valeur documentée par Storyblok). */
const MAX_AGE_SECONDS = 60 * 60;
/** Tolérance pour un léger décalage d'horloge entre Storyblok et le serveur. */
const MAX_FUTURE_SKEW_SECONDS = 5 * 60;

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Vérifie que la requête vient bien de l'éditeur visuel Storyblok.
 *
 * L'éditeur ajoute à l'URL d'aperçu `_storyblok_tk[space_id]`,
 * `_storyblok_tk[timestamp]` et `_storyblok_tk[token]`, où le token vaut
 * sha1("space_id:jeton_preview:timestamp"). Seul quelqu'un qui connaît le
 * jeton preview peut produire une signature valide.
 * https://www.storyblok.com/faq/how-to-verify-the-preview-query-parameters-of-the-visual-editor
 */
export function isSignedStoryblokPreview(
  searchParams: SearchParams,
  nowMs: number = Date.now()
): boolean {
  const spaceId = single(searchParams["_storyblok_tk[space_id]"]);
  const timestamp = single(searchParams["_storyblok_tk[timestamp]"]);
  const signature = single(searchParams["_storyblok_tk[token]"]);

  if (!spaceId || !timestamp || !signature) return false;
  if (!/^\d{1,20}$/.test(spaceId) || !/^\d{1,12}$/.test(timestamp)) return false;
  if (!/^[0-9a-f]{40}$/i.test(signature)) return false;

  // Rejet des signatures trop anciennes (ou datées dans le futur).
  const nowSeconds = Math.floor(nowMs / 1000);
  const signedAt = Number(timestamp);
  if (signedAt <= nowSeconds - MAX_AGE_SECONDS) return false;
  if (signedAt > nowSeconds + MAX_FUTURE_SKEW_SECONDS) return false;

  let previewToken: string;
  try {
    previewToken = getStoryblokToken();
  } catch (error) {
    console.error(error);
    return false;
  }

  const expected = createHash("sha1")
    .update(`${spaceId}:${previewToken}:${timestamp}`)
    .digest("hex");

  // Comparaison en temps constant (les deux font 40 caractères hexadécimaux).
  return timingSafeEqual(Buffer.from(signature.toLowerCase()), Buffer.from(expected));
}
