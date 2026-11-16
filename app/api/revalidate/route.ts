// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { STORYBLOK_CACHE_TAG } from "@/lib/storyblok";
import { after, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function authorized(url: string) {
  const provided = new URL(url).searchParams.get("secret") ?? "";
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (!expected || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
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
  if (!authorized(req.url)) return NextResponse.json({ ok: false }, { status: 401 });
  let action = "unknown";
  try {
    const body = await req.json();
    action = body?.action || body?.event || "unknown";
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

export async function GET(req: Request) {
  if (!authorized(req.url)) return NextResponse.json({ ok: false }, { status: 401 });
  revalidateTag(STORYBLOK_CACHE_TAG, "max");
  warmHome(req.url);
  return NextResponse.json({ ok: true, revalidated: true, method: "GET" });
}
