// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { STORYBLOK_CACHE_TAG } from "@/lib/storyblok";

// Webhook Storyblok : POST uniquement (aucun autre verbe n'est exporté, Next
// répond 405), authentifié par la signature de Storyblok et non par un secret
// dans l'URL.
//
// Quand un « Webhook secret » est configuré dans Storyblok, chaque requête
// porte un en-tête `webhook-signature` : HMAC-SHA1 (hexadécimal) du corps brut,
// avec ce secret pour clé.
// https://www.storyblok.com/docs/concepts/webhooks
function hasValidSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.STORYBLOK_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = Buffer.from(createHmac("sha1", secret).update(rawBody).digest("hex"));
  const provided = Buffer.from(signature.trim().toLowerCase());
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

// ⛏️ util: patch Edge Config "assetBump"
async function bumpAssets() {
  if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) return;
  await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ operation: "upsert", key: "assetBump", value: Date.now() }],
    }),
  });
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
  // Le corps brut est lu avant toute analyse JSON : c'est lui qui est signé.
  const rawBody = await req.text();
  if (!hasValidSignature(rawBody, req.headers.get("webhook-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let action = "unknown";
  try {
    const body: { action?: unknown; event?: unknown } = JSON.parse(rawBody);
    const value = body.action ?? body.event;
    if (typeof value === "string" && value) action = value;
  } catch {}

  // 1) Périmer le contenu Storyblok en cache. Profil "max" : l'ancienne page
  //    reste servie pendant la régénération, et le reste si Storyblok est
  //    indisponible à ce moment-là (un revalidatePath purgeait le cache et
  //    exposait une erreur 500 dans ce cas).
  revalidateTag(STORYBLOK_CACHE_TAG, "max");
  warmHome(req.url);

  // 2) Si un asset a changé, on "bump" la version images
  if (action.startsWith("asset.")) {
    await bumpAssets();
  }

  return NextResponse.json({ ok: true, revalidated: true, action });
}
