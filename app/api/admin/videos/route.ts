import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-session';
import { deleteUpload, headUpload, listUploads, publicUrl, r2Configured } from '@/lib/r2';
import { isUsedIn, storyblokContentText } from '@/lib/storyblok-usage';
import { isUploadKey, posterKey } from '@/lib/videos';

const noStore = { 'Cache-Control': 'no-store' };

/**
 * GET : vidéos envoyées, de la plus récente à la plus ancienne, avec leur empreinte
 * (détection des doublons) et leur utilisation dans Storyblok (`used` : true, false, ou
 * null si Storyblok n'a pas pu être lu — la suppression est alors bloquée).
 */
export async function GET() {
  if (!(await hasAdminSession())) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: 'Le stockage n’est pas configuré.' }, { status: 503 });
  try {
    const [objects, content] = await Promise.all([
      listUploads(),
      storyblokContentText().catch((error) => {
        console.error(error);
        return null;
      }),
    ]);
    const keys = new Set(objects.map((o) => o.key));
    const videos = await Promise.all(
      objects
        .filter((o) => isUploadKey(o.key))
        .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
        .map(async (o) => ({
          key: o.key,
          url: publicUrl(o.key),
          poster: keys.has(posterKey(o.key)) ? publicUrl(posterKey(o.key)) : null,
          size: o.size,
          lastModified: o.lastModified,
          sha256: (await headUpload(o.key).catch(() => null))?.sha256 ?? null,
          used: content === null ? null : isUsedIn(content, o.key),
        }))
    );
    return NextResponse.json({ videos, usageKnown: content !== null }, { headers: noStore });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'La liste des vidéos n’a pas pu être lue.' }, { status: 502 });
  }
}

/**
 * DELETE { key } : supprime une vidéo envoyée par la page et son affiche.
 * - la clé doit être exactement celle d'une vidéo de la page (uploads/…-xxxxxx-LxH.mp4),
 *   sans aucune normalisation : tout le reste du bucket est hors d'atteinte ;
 * - l'affiche est déduite côté serveur, jamais reçue du navigateur ;
 * - refus si la vidéo est utilisée dans Storyblok (brouillon ou publié), ou si cette
 *   vérification échoue.
 */
export async function DELETE(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: 'Le stockage n’est pas configuré.' }, { status: 503 });
  let key: unknown;
  try {
    key = ((await request.json()) as { key?: unknown }).key;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (typeof key !== 'string' || !isUploadKey(key)) {
    return NextResponse.json({ error: 'Seules les vidéos envoyées par cette page peuvent être supprimées.' }, { status: 400 });
  }
  if (!(await headUpload(key))) {
    return NextResponse.json({ error: 'Cette vidéo n’existe plus.' }, { status: 404 });
  }
  let content: string;
  try {
    content = await storyblokContentText();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Impossible de vérifier si la vidéo est utilisée sur le site (Storyblok injoignable). Réessayez plus tard.' },
      { status: 503 }
    );
  }
  if (isUsedIn(content, key)) {
    return NextResponse.json(
      {
        error:
          'Cette vidéo est utilisée sur le site. Retirez d’abord le bloc qui la contient dans Storyblok et publiez la page, puis réessayez.',
      },
      { status: 409 }
    );
  }
  await deleteUpload(key);
  await deleteUpload(posterKey(key));
  return new NextResponse(null, { status: 204 });
}
