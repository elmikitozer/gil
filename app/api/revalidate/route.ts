// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { STORYBLOK_CACHE_TAG } from "@/lib/storyblok";

// Webhook Storyblok : POST uniquement (aucun autre verbe n'est exporté, Next
// répond 405), authentifié par un secret passé dans l'URL (?secret=…).
//
// Le plan gratuit de Storyblok ne propose ni « Webhook secret » (en-tête
// webhook-signature) ni en-têtes personnalisés : l'URL est le seul endroit où
// placer un secret. Il peut donc apparaître dans des journaux d'accès ; en
// cas de doute, le changer dans Vercel puis dans l'URL du webhook.
function hasValidSecret(requestUrl: string): boolean {
  const expected = process.env.STORYBLOK_WEBHOOK_SECRET;
  const provided = new URL(requestUrl).searchParams.get("secret");
  if (!expected || !provided) return false;

  // Comparaison en temps constant ; le hachage donne deux tampons de même
  // longueur, ce qui évite aussi de révéler la longueur du secret.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

// Réchauffement : une fois la réponse envoyée, on demande la home pour
// déclencher sa régénération tout de suite. La personne qui vient de publier
// voit ainsi la nouvelle version dès son premier rechargement. Un échec ici
// est sans conséquence : la régénération aura lieu à la prochaine visite.
function warmHome(requestUrl: string) {
  after(async () => {
    try {
      await fetch(new URL("/", requestUrl), {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      console.warn("Réchauffement de la home impossible :", error);
    }
  });
}

export async function POST(req: Request) {
  if (!hasValidSecret(req.url)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let action = "unknown";
  try {
    const body: { action?: unknown; event?: unknown } = await req.json();
    const value = body.action ?? body.event;
    if (typeof value === "string" && value) action = value;
  } catch {}

  // Périmer le contenu Storyblok en cache. Profil "max" : l'ancienne page
  // reste servie pendant la régénération, et le reste si Storyblok est
  // indisponible à ce moment-là (un revalidatePath purgeait le cache et
  // exposait une erreur 500 dans ce cas).
  revalidateTag(STORYBLOK_CACHE_TAG, "max");
  warmHome(req.url);

  return NextResponse.json({ ok: true, revalidated: true, action });
}
