// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

function authorized(url: string) {
  return new URL(url).searchParams.get("secret") === process.env.REVALIDATE_SECRET;
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

export async function POST(req: Request) {
  if (!authorized(req.url)) return NextResponse.json({ ok: false }, { status: 401 });
  let action = "unknown";
  try {
    const body = await req.json();
    action = body?.action || body?.event || "unknown";
  } catch {}

  // 1) Revalider la home (et autres si besoin)
  revalidatePath("/");

  // 2) Si un asset a changé, on "bump" la version images
  if (action.startsWith("asset.")) {
    await bumpAssets();
  }

  return NextResponse.json({ ok: true, revalidated: true, action });
}

export async function GET(req: Request) {
  if (!authorized(req.url)) return NextResponse.json({ ok: false }, { status: 401 });
  revalidatePath("/");
  return NextResponse.json({ ok: true, revalidated: true, method: "GET" });
}
