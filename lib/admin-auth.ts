import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

// Session de la page d'envoi des vidéos (/admin/videos).
//
// Un seul mot de passe, partagé, dans ADMIN_VIDEOS_PASSWORD. Une fois vérifié,
// le serveur pose un cookie httpOnly signé (HMAC-SHA256 avec
// ADMIN_SESSION_SECRET) qui porte sa date d'expiration. Changer l'une des deux
// variables déconnecte toutes les sessions ouvertes.

export const SESSION_COOKIE = 'gil_admin';
export const SESSION_SECONDS = 30 * 24 * 3600; // 30 jours

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/** Vrai si la configuration est complète (sinon la page reste fermée). */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_VIDEOS_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

/** Comparaison en temps constant du mot de passe saisi. */
export function passwordMatches(provided: string): boolean {
  const expected = process.env.ADMIN_VIDEOS_PASSWORD;
  if (!expected || !provided) return false;
  return timingSafeEqual(sha256(provided), sha256(expected));
}

function sign(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET manquant');
  // Le mot de passe entre dans la signature : le changer invalide les sessions.
  return createHmac('sha256', secret)
    .update(`${payload}.${process.env.ADMIN_VIDEOS_PASSWORD ?? ''}`)
    .digest('base64url');
}

/** Valeur du cookie pour une session qui expire dans SESSION_SECONDS. */
export function createSessionValue(now = Date.now()): string {
  const exp = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${exp}.${sign(exp)}`;
}

/** Vrai si le cookie est signé par ce serveur et pas encore expiré. */
export function isValidSession(value: string | undefined, now = Date.now()): boolean {
  if (!value || !adminConfigured()) return false;
  const [exp, signature] = value.split('.');
  if (!exp || !signature || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < now) return false;
  return timingSafeEqual(sha256(signature), sha256(sign(exp)));
}
