// Réponse statique : produite au build et servie par le CDN, sans exécuter de fonction.
// Elle prouve que le site est en ligne, pas que Storyblok répond. L'ancien champ `time`
// (heure de la requête) n'a plus de sens : il aurait indiqué l'heure du build.
export const dynamic = 'force-static';

export function GET() {
  return Response.json({ ok: true });
}
